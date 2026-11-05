<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListServicesQuery;
use Modules\Dashboard\Handlers\Services\ListServicesHandler;
use Modules\Dashboard\Http\Requests\Business\ListServicesRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceResource;
use Modules\Dashboard\Support\DashboardActor;

final class ListServicesAction extends BaseApiAction
{
    public function __construct(private readonly ListServicesHandler $handler) {}

    public function __invoke(ListServicesRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $services = $this->handler->handle(new ListServicesQuery(
            $actor->scopedBrandIds(),
            $request->integer('per_page', 15),
            $request->validated('search'),
        ));

        return $this->paginated($services, DashboardServiceResource::class);
    }
}
