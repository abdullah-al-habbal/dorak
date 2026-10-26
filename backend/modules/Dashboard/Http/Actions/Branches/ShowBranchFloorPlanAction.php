<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Http\Resources\Shared\ChairResource;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Support\FloorPlanLayout;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBranchFloorPlanAction extends BaseApiAction
{
    public function __construct(private readonly ShowBranchHandler $handler) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $model */
        $model = $this->handler->handle(new ShowBranchQuery($branch, $actor->scopedBrandIds(), $actor->scopedBranchIds()));
        $model->load('chairs.barber');

        return $this->success([
            'branch_id' => $model->id,
            'branch_name' => $model->name,
            'floor_plan' => FloorPlanLayout::payload($model),
            'chairs' => ChairResource::collection($model->chairs)->resolve($request),
        ]);
    }
}
