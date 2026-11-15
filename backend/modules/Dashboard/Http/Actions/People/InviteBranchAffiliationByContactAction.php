<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Branch\InviteAffiliationCommand;
use Modules\BarberAffiliation\Eloquent\Resolvers\Barber\BarberAlreadyAffiliatedException;
use Modules\BarberAffiliation\Handlers\Branch\InviteAffiliationHandler;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\InviteBarberByContactRequest;
use Modules\Dashboard\Support\AffiliationActorResolver;
use Modules\Dashboard\Support\ScopedBranchResolver;

/**
 * F-10: invites a barber by exact email or phone without revealing whether that person exists. A match
 * that is discoverable and not yet affiliated receives the invitation; every other case does nothing, and
 * the caller gets the same 202 either way.
 */
final class InviteBranchAffiliationByContactAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandApprovalGuard $approvals,
        private readonly InviteAffiliationHandler $handler,
        private readonly AffiliationActorResolver $actors,
    ) {}

    public function __invoke(InviteBarberByContactRequest $request, string $branch): JsonResponse
    {
        $model = $this->branches->resolveForStaffingWrite($request, $branch);
        $this->approvals->ensureBranchBrandApproved($request->attributes->get('dashboard_actor'), $model->getKey());

        $contact = $request->contact();
        $barber = BarberModel::query()->discoverable()->where(fn ($match) => $match->where('email', $contact)->orWhere('phone', $contact))->first();

        if ($barber !== null) {
            $this->invite($request, (string) $model->getKey(), (string) $barber->getKey());
        }

        return $this->success(message: __('dashboard::messages.invitation_requested'), status: 202);
    }

    private function invite(InviteBarberByContactRequest $request, string $branchId, string $barberId): void
    {
        try {
            $affiliation = $this->handler->handle(new InviteAffiliationCommand(
                branchId: $branchId,
                barberId: $barberId,
                commissionPercent: $request->commissionPercent(),
                actor: $this->actors->actingAs($request),
            ));
        } catch (BarberAlreadyAffiliatedException) {
            return;
        }

        AffiliationInvitedNotification::dispatch((string) $affiliation->id, app()->getLocale())->afterCommit();
    }
}
