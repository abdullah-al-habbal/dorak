<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Illuminate\Support\Facades\DB;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Exceptions\BarberReviewException;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Services\PlatformNotifier;

/** Every barber review transition runs under a row lock so two admins (or a double click) cannot race. */
final class BarberReviewService
{
    public function __construct(private readonly BarberReviewMailer $mailer) {}

    public function approve(string $barberId): BarberModel
    {
        $barber = DB::transaction(function () use ($barberId): BarberModel {
            $barber = $this->lock($barberId);
            if ($barber->status !== BarberStatusEnum::Pending) {
                throw BarberReviewException::notPending();
            }

            $barber->forceFill([
                'status' => BarberStatusEnum::Enabled,
                'rejection_reason' => null,
                'reviewed_at' => now(),
            ])->save();
            ActivationLogModel::query()->create([
                'activable_id' => $barber->getKey(),
                'activable_type' => ActivableTypeEnum::Barber,
                'status' => ActivationStatusEnum::Enabled,
                'reason' => null,
                'activated_at' => now(),
            ]);

            return $barber;
        });
        $this->mailer->approved($barber);

        return $barber;
    }

    public function reject(string $barberId, string $reason): BarberModel
    {
        $barber = DB::transaction(function () use ($barberId, $reason): BarberModel {
            $barber = $this->lock($barberId);
            if ($barber->status !== BarberStatusEnum::Pending) {
                throw BarberReviewException::notPending();
            }

            $barber->forceFill([
                'status' => BarberStatusEnum::Rejected,
                'rejection_reason' => $reason,
                'reviewed_at' => now(),
            ])->save();

            return $barber;
        });
        $this->mailer->rejected($barber, $reason);

        return $barber;
    }

    /** A rejected barber fixes the profile and goes back to `pending`, up to {@see BarberReviewConstants::MAX_SUBMISSIONS} submissions. */
    /** @param array<string, mixed> $profile optional fixes (name, bio, phone) applied with the resubmission */
    public function resubmit(string $barberId, array $profile = []): BarberModel
    {
        return DB::transaction(function () use ($barberId, $profile): BarberModel {
            $barber = $this->lock($barberId);
            if ($barber->status !== BarberStatusEnum::Rejected) {
                throw BarberReviewException::notRejected();
            }
            if ((int) $barber->submission_count >= BarberReviewConstants::MAX_SUBMISSIONS) {
                throw BarberReviewException::resubmissionLimit();
            }

            $barber->forceFill([
                ...$profile,
                'status' => BarberStatusEnum::Pending,
                'submission_count' => (int) $barber->submission_count + 1,
            ])->save();
            app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::BarberAwaitingApproval, (string) $barber->getKey());

            return $barber;
        });
    }

    private function lock(string $barberId): BarberModel
    {
        return BarberModel::query()->whereKey($barberId)->lockForUpdate()->firstOrFail();
    }
}
