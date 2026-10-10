<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowChairQuery;
use Modules\Dashboard\Handlers\Chairs\ShowChairHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowChairAction extends BaseApiAction
{
    public function __construct(private readonly ShowChairHandler $handler) {}

    public function __invoke(Request $request, string $chair): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->handler->handle(new ShowChairQuery(
            $chair,
            $actor->isPlatformAdmin() ? null : $actor->branchId,
        ));

        return $this->ok(ChairResource::make($model));
    }
}
