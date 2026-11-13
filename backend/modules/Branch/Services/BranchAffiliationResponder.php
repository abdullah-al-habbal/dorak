<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\ValuesObjects\AffiliationActor;
use Modules\Branch\Exceptions\AffiliationResponseException;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Brand\Services\BrandStaffingGuard;

/** Accept/reject of a pending affiliation addressed to a branch; shared by the branch-account and dashboard routes. */
final readonly class BranchAffiliationResponder
{
    public function __construct(
        private StatusChangeLogger $statusChangeLogger,
        private BrandStaffingGuard $staffingGuard,
        private BrandFeatures $brandFeatures,
    ) {}

    /**
     * Lock order: barber, affiliation, brand. The status is checked after the lock, so two answers to
     * the same request (or to two requests of one barber) cannot both succeed.
     *
     * @throws AffiliationResponseException
     */
    public function respond(BranchModel $branch, string $affiliationId, bool $accept, ?AffiliationActor $actor = null): BarberAffiliationModel
    {
        $barberId = $this->findForBranch($branch, $affiliationId)->barber_id;

        $affiliation = DB::transaction(function () use ($branch, $affiliationId, $accept, $actor, $barberId): BarberAffiliationModel {
            BarberModel::query()->lockForUpdate()->find($barberId);
            $affiliation = $this->findForBranch($branch, $affiliationId, lock: true);

            $this->ensureAnswerable($affiliation, $branch);

            if ($accept) {
                $this->staffingGuard->ensureBrandAcceptsBarbers($branch->brand_id);
                $this->brandFeatures->ensureBranchManageable($branch->getKey());
            }

            $this->transition($affiliation, $accept ? AffiliationStatus::Active : AffiliationStatus::Rejected, $branch, $actor);

            return $affiliation;
        });

        AffiliationRespondedNotification::dispatch((string) $affiliation->id, $accept, app()->getLocale())->afterCommit();

        return $affiliation->fresh()->load('barber');
    }

    public function findForBranch(BranchModel $branch, string $affiliationId, bool $lock = false): BarberAffiliationModel
    {
        return BarberAffiliationModel::where('affiliable_id', $branch->id)
            ->where('affiliable_type', 'branch')
            ->when($lock, fn ($query) => $query->lockForUpdate())
            ->findOrFail($affiliationId);
    }

    /** @throws AffiliationResponseException */
    private function ensureAnswerable(BarberAffiliationModel $affiliation, BranchModel $branch): void
    {
        if ($affiliation->initiated_by_type === AffiliationInitiatorTypeEnum::Branch && $affiliation->initiated_by_id === $branch->id) {
            throw AffiliationResponseException::ownInvite();
        }

        if ($affiliation->status !== AffiliationStatus::Pending) {
            throw AffiliationResponseException::notPending();
        }
    }

    private function transition(BarberAffiliationModel $affiliation, AffiliationStatus $next, BranchModel $branch, ?AffiliationActor $actor): void
    {
        $fromStatus = $affiliation->status;

        $affiliation->update([
            'status' => $next,
            ...$next === AffiliationStatus::Active ? ['accepted_at' => now()] : [],
        ]);

        $this->statusChangeLogger->log(
            StatusChangeSubjectTypeEnum::Affiliation,
            (string) $affiliation->id,
            $fromStatus->value,
            $next->value,
            $actor?->type ?? StatusChangeActorTypeEnum::Branch,
            $actor?->id ?? (string) $branch->id,
        );
    }
}
