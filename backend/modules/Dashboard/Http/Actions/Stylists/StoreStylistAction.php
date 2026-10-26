<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreStylistCommand;
use Modules\Dashboard\Handlers\Stylists\StoreStylistHandler;
use Modules\Dashboard\Http\Requests\Business\StoreStylistRequest;
use Modules\Dashboard\Support\DashboardActor;

final class StoreStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures, private readonly StoreStylistHandler $handler) {}

    public function __invoke(StoreStylistRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && ! isset($attributes['chair_id'])) {
            return $this->unprocessable(__('dashboard::messages.assign_branch_chair'));
        }

        $this->brandFeatures->ensureChairBranchManageable($attributes['chair_id'] ?? null);

        return $this->created(BarberResource::make($this->handler->handle(
            new StoreStylistCommand($attributes, $actor->scopedBranchIds()),
        )));
    }
}
