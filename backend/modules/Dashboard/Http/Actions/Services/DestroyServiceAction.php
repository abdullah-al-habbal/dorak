<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyServiceCommand;
use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Handlers\Services\DestroyServiceHandler;
use Modules\Dashboard\Handlers\Services\ShowServiceHandler;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class DestroyServiceAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowServiceHandler $showHandler,
        private readonly DestroyServiceHandler $destroyHandler,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(Request $request, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowServiceQuery(
            $service,
            $actor->scopedBrandIds(),
        ));
        Gate::forUser($actor)->authorize('dashboard.service.write', [$model->serviceable_type->value, $model->serviceable_id]);
        $this->writeGuard->ensureServiceableWritable($actor, $model->serviceable_type, $model->serviceable_id);
        $this->destroyHandler->handle($model, new DestroyServiceCommand($service));

        return $this->deleted();
    }
}
