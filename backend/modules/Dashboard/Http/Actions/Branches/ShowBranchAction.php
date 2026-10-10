<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBranchAction extends BaseApiAction
{
    public function __construct(private readonly ShowBranchHandler $handler) {}

    public function __invoke(Request $request, BranchModel $branch): JsonResponse
    { /** @var DashboardActor $actor */ $actor = $request->attributes->get('dashboard_actor');
        $result = $this->handler->handle(new ShowBranchQuery($branch->id, $actor->isPlatformAdmin() ? null : $actor->brandId));

        return $this->success($result);
    }
}
