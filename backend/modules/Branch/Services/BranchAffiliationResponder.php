<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationParty;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Exceptions\AffiliationResponseException;
use Modules\Branch\Models\BranchModel;

/** Accept/reject of a pending affiliation addressed to a branch; shared by the branch-account and dashboard routes. */
final readonly class BranchAffiliationResponder
{
    public function __construct(private StatusChangeLogger $statusChangeLogger) {}

    /** @throws AffiliationResponseException */
    public function respond(BranchModel $branch, string $affiliationId, bool $accept): BarberAffiliationModel
    {
        $affiliation = $this->findForBranch($branch, $affiliationId);

        if (AffiliationParty::isBranch($affiliation->initiated_by_type) && $affiliation->initiated_by_id === $branch->id) {
            throw AffiliationResponseException::ownInvite();
        }

        if ($affiliation->status !== AffiliationStatus::Pending) {
            throw AffiliationResponseException::notPending();
        }

        $next = $accept ? AffiliationStatus::Active : AffiliationStatus::Rejected;

        DB::transaction(function () use ($affiliation, $branch, $next, $accept): void {
            $fromStatus = $affiliation->status;
            $affiliation->update([
                'status' => $next,
                ...$accept ? ['accepted_at' => now()] : [],
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliation->id,
                $fromStatus->value,
                $next->value,
                StatusChangeActorTypeEnum::Branch,
                (string) $branch->id,
            );
        });

        AffiliationRespondedNotification::dispatch((string) $affiliation->id, $accept, app()->getLocale())->afterCommit();

        return $affiliation->fresh()->load('barber');
    }

    public function findForBranch(BranchModel $branch, string $affiliationId): BarberAffiliationModel
    {
        return BarberAffiliationModel::where('affiliable_id', $branch->id)
            ->where('affiliable_type', 'branch')
            ->findOrFail($affiliationId);
    }
}
