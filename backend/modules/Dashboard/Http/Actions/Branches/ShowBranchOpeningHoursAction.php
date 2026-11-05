<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBranchOpeningHoursAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowBranchHandler $handler,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(Request $request, BranchModel $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $scoped */
        $scoped = $this->handler->handle(new ShowBranchQuery(
            (string) $branch->getKey(),
            $actor->scopedBrandIds(),
            $actor->scopedBranchIds(),
        ));

        return $this->success(['opening_hours' => $this->hours->week($scoped)]);
    }
}
