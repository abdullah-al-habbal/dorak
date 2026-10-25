<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationParty;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class RejectAffiliationAction extends BaseApiAction
{
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

        $affiliationModel->update([
            'status' => AffiliationStatus::Rejected,
        ]);

        AffiliationRespondedNotification::dispatch((string) $affiliationModel->id, false, app()->getLocale())->afterCommit();

        return $this->success(
            data: $affiliationModel->fresh()->load('barber'),
            code: SuccessCodeEnum::UPDATED,
        );
    }
}
