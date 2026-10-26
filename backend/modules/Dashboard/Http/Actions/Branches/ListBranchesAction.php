<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Http\Resources\Shared\BranchResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListBranchesQuery;
use Modules\Dashboard\Handlers\Branches\ListBranchesHandler;
use Modules\Dashboard\Http\Requests\Business\ListBranchesRequest;
use Modules\Dashboard\Support\DashboardActor;

final class ListBranchesAction extends BaseApiAction
{
    public function __construct(private readonly ListBranchesHandler $handler) {}

    public function __invoke(ListBranchesRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $branches = $this->handler->handle(new ListBranchesQuery(
            $actor->scopedBrandIds(),
            $request->integer('per_page', 15),
            $actor->scopedBranchIds(),
            $request->validated('search'),
        ));

        return $this->paginated($branches, BranchResource::class);
    }
}
