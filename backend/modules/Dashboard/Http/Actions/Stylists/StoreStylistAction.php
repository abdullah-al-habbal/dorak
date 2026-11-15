<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreStylistCommand;
use Modules\Dashboard\Handlers\Stylists\StoreStylistHandler;
use Modules\Dashboard\Http\Requests\Business\StoreStylistRequest;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class StoreStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BrandApprovalGuard $approvals,
        private readonly StoreStylistHandler $handler,
        private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(StoreStylistRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.stylist.create');
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && ! isset($attributes['chair_id'])) {
            return $this->unprocessable(__('dashboard::messages.assign_branch_chair'));
        }

        $this->writeGuard->ensureChairWritable($actor, $attributes['chair_id'] ?? null);
        $this->approvals->ensureChairBrandApproved($actor, $attributes['chair_id'] ?? null);
        $this->brandFeatures->ensureChairBranchManageable($attributes['chair_id'] ?? null);

        return $this->created(BarberResource::make($this->handler->handle(
            new StoreStylistCommand($attributes, $actor->scopedBranchIds()),
        )));
    }
}
