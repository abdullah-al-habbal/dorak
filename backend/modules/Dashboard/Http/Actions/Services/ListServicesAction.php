<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListServicesQuery;
use Modules\Dashboard\Handlers\Services\ListServicesHandler;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class ListServicesAction extends BaseApiAction
{
    public function __construct(private readonly ListServicesHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $services = $this->handler->handle(new ListServicesQuery(
            $actor->scopedBranchIds(),
            $request->integer('per_page', 15),
        ));

        return $this->paginated($services, ServiceResource::class);
    }
}
