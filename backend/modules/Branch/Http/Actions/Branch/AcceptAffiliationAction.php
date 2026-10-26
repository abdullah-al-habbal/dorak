<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationParty;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class AcceptAffiliationAction extends BaseApiAction
{
    public function __construct(private readonly StatusChangeLogger $statusChangeLogger) {}

    public function __invoke(Request $request, string $affiliation): JsonResponse
    {
        $branch = $request->user('branch_api');

        $affiliationModel = BarberAffiliationModel::where('affiliable_id', $branch->id)
            ->where('affiliable_type', 'branch')
            ->findOrFail($affiliation);

        if (AffiliationParty::isBranch($affiliationModel->initiated_by_type) && $affiliationModel->initiated_by_id === $branch->id) {
            return $this->businessError(ErrorCodeEnum::FORBIDDEN, message: __('barberaffiliation::messages.cannot_accept_own_invite'));
        }

        if ($affiliationModel->status !== AffiliationStatus::Pending) {
            return $this->businessError(ErrorCodeEnum::BAD_REQUEST, message: __('branch::messages.affiliation_not_pending'));
        }

        DB::transaction(function () use ($affiliationModel, $branch): void {
            $fromStatus = $affiliationModel->status;
            $affiliationModel->update([
                'status' => AffiliationStatus::Active,
                'accepted_at' => now(),
            ]);

            $this->statusChangeLogger->log(
                StatusChangeSubjectTypeEnum::Affiliation,
                (string) $affiliationModel->id,
                $fromStatus->value,
                AffiliationStatus::Active->value,
                StatusChangeActorTypeEnum::Branch,
                (string) $branch->id,
            );
        });

        AffiliationRespondedNotification::dispatch((string) $affiliationModel->id, true, app()->getLocale())->afterCommit();

        return $this->success(
            data: $affiliationModel->fresh()->load('barber'),
            code: SuccessCodeEnum::UPDATED,
        );
    }
}
