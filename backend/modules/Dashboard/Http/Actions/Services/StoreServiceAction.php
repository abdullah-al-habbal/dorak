<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreServiceCommand;
use Modules\Dashboard\Handlers\Services\StoreServiceHandler;
use Modules\Dashboard\Http\Requests\ServiceRequest;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class StoreServiceAction extends BaseApiAction
{
    public function __construct(private readonly StoreServiceHandler $handler) {}

    public function __invoke(ServiceRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && ($attributes['serviceable_type'] !== 'branch' || ! $actor->canAccessBranch($attributes['serviceable_id']))) {
            return $this->forbidden();
        }

        return $this->created(ServiceResource::make(
            $this->handler->handle(new StoreServiceCommand($attributes)),
        ));
    }
}
