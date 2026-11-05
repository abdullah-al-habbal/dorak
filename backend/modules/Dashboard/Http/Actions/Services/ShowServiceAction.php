<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Handlers\Services\ShowServiceHandler;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceResource;
use Modules\Dashboard\Support\DashboardActor;

final class ShowServiceAction extends BaseApiAction
{
    public function __construct(private readonly ShowServiceHandler $handler) {}

    public function __invoke(Request $request, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->handler->handle(new ShowServiceQuery(
            $service,
            $actor->scopedBrandIds(),
        ));

        return $this->ok(DashboardServiceResource::make($model->loadMissing('catalogItem.category')));
    }
}
