<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListChairsQuery;
use Modules\Dashboard\Handlers\Chairs\ListChairsHandler;
use Modules\Dashboard\Http\Requests\Business\ListChairsRequest;
use Modules\Dashboard\Support\DashboardActor;

final class ListChairsAction extends BaseApiAction
{
    public function __construct(private readonly ListChairsHandler $handler) {}

    public function __invoke(ListChairsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $chairs = $this->handler->handle(new ListChairsQuery(
            $actor->scopedBranchIds(),
            $request->integer('per_page', 15),
            $request->validated('search'),
        ));

        return $this->paginated($chairs, ChairResource::class);
    }
}
