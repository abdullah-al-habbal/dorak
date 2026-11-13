<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\BarberAffiliation\Eloquent\Resolvers\Barber\BarberAlreadyAffiliatedException;
use Modules\BarberAffiliation\Handlers\Branch\InviteAffiliationHandler;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\Branch\Http\Requests\Branch\InviteAffiliationRequest;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Resources\Shared\DashboardAffiliationResource;
use Modules\Dashboard\Support\AffiliationActorResolver;
use Modules\Dashboard\Support\ScopedBranchResolver;

final class InviteBranchAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandApprovalGuard $approvals,
        private readonly InviteAffiliationHandler $handler,
        private readonly AffiliationActorResolver $actors,
    ) {}

    public function __invoke(InviteAffiliationRequest $request, string $branch): JsonResponse
    {
        $model = $this->branches->resolveForStaffing($request, $branch);
        $this->approvals->ensureBranchBrandApproved($request->attributes->get('dashboard_actor'), $model->getKey());

        try {
            $affiliation = $this->handler->handle($request->toCommand((string) $model->getKey(), $this->actors->actingAs($request)));
        } catch (BarberAlreadyAffiliatedException) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, message: __('barberaffiliation::messages.already_affiliated'));
        }

        AffiliationInvitedNotification::dispatch((string) $affiliation->id, app()->getLocale())->afterCommit();

        return $this->created(data: new DashboardAffiliationResource($affiliation->load('barber')));
    }
}
