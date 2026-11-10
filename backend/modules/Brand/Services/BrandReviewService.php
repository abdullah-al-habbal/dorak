<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandReviewConstants;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Exceptions\BrandReviewException;
use Modules\Brand\Models\BrandModel;
use Modules\Dashboard\Services\OwnerBrandMailer;

/**
 * Every brand lifecycle move (approve, reject, resubmit, suspend, reactivate) runs under a row
 * lock, is recorded in `status_change_logs` and mails the owner after the transaction.
 */
final class BrandReviewService
{
    public function __construct(
        private readonly StatusChangeLogger $logger,
        private readonly OwnerBrandMailer $mailer,
        private readonly BrandSuspensionBookings $bookings,
    ) {}

    public function approve(string $brandId, string $adminId): BrandModel
    {
        $brand = $this->move($brandId, BrandStatusEnum::Pending, BrandStatusEnum::Active, null, StatusChangeActorTypeEnum::Admin, $adminId);
        // D9: a branch prepared while the brand was pending now waits for its owner to switch it on.
        BranchModel::query()->where('brand_id', $brand->getKey())->where('status', BranchStatusEnum::Pending->value)->update(['status' => BranchStatusEnum::Disabled->value]);
        $this->mailer->approved($brand);

        return $brand;
    }

    public function reject(string $brandId, string $adminId, string $reason): BrandModel
    {
        $brand = $this->move($brandId, BrandStatusEnum::Pending, BrandStatusEnum::Rejected, $reason, StatusChangeActorTypeEnum::Admin, $adminId);
        $this->mailer->rejected($brand, $reason);

        return $brand;
    }

    /** The owner fixed the profile: back to `pending`, at most {@see BrandReviewConstants::BRAND_MAX_SUBMISSIONS} submissions in total. */
    public function resubmit(string $brandId, string $ownerId): BrandModel
    {
        return DB::transaction(function () use ($brandId, $ownerId): BrandModel {
            $brand = $this->lock($brandId);
            if ($brand->status !== BrandStatusEnum::Rejected) {
                throw BrandReviewException::notRejected();
            }
            if ((int) $brand->submission_count >= BrandReviewConstants::BRAND_MAX_SUBMISSIONS) {
                throw BrandReviewException::resubmissionLimit();
            }

            $brand->forceFill(['status' => BrandStatusEnum::Pending, 'submission_count' => (int) $brand->submission_count + 1])->save();
            $this->record($brand, BrandStatusEnum::Rejected, BrandStatusEnum::Pending, null, StatusChangeActorTypeEnum::Owner, $ownerId);

            return $brand;
        });
    }

    public function suspend(string $brandId, string $adminId, string $reason, bool $cancelFutureBookings): BrandModel
    {
        $brand = $this->move($brandId, BrandStatusEnum::Active, BrandStatusEnum::Suspended, $reason, StatusChangeActorTypeEnum::Admin, $adminId);
        if ($cancelFutureBookings) {
            $this->bookings->cancelFutureBookings($brand, $adminId);
        }
        $this->mailer->suspended($brand, $reason);

        return $brand;
    }

    public function reactivate(string $brandId, string $adminId): BrandModel
    {
        $brand = $this->move($brandId, BrandStatusEnum::Suspended, BrandStatusEnum::Active, null, StatusChangeActorTypeEnum::Admin, $adminId);
        $this->mailer->reactivated($brand);

        return $brand;
    }

    private function move(string $brandId, BrandStatusEnum $from, BrandStatusEnum $to, ?string $reason, StatusChangeActorTypeEnum $actor, string $actorId): BrandModel
    {
        return DB::transaction(function () use ($brandId, $from, $to, $reason, $actor, $actorId): BrandModel {
            $brand = $this->lock($brandId);
            if ($brand->status !== $from) {
                throw match ($from) {
                    BrandStatusEnum::Pending => BrandReviewException::notPending(),
                    BrandStatusEnum::Active => BrandReviewException::notActive(),
                    BrandStatusEnum::Suspended => BrandReviewException::notSuspended(),
                    BrandStatusEnum::Rejected => BrandReviewException::notRejected(),
                };
            }

            $brand->forceFill(['status' => $to, 'status_reason' => $reason])->save();
            $this->record($brand, $from, $to, $reason, $actor, $actorId);

            return $brand;
        });
    }

    private function record(BrandModel $brand, BrandStatusEnum $from, BrandStatusEnum $to, ?string $reason, StatusChangeActorTypeEnum $actor, string $actorId): void
    {
        $this->logger->log(StatusChangeSubjectTypeEnum::Brand, (string) $brand->getKey(), $from->value, $to->value, $actor, $actorId, $reason);
    }

    private function lock(string $brandId): BrandModel
    {
        return BrandModel::query()->whereKey($brandId)->lockForUpdate()->firstOrFail();
    }
}
