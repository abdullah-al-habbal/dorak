<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;

/** Resolves a branch inside the dashboard actor's scope; anything outside it is a 404. */
final readonly class ScopedBranchResolver
{
    public function __construct(private ShowBranchHandler $handler) {}

    public function resolve(Request $request, string $branchId): BranchModel
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $branch */
        $branch = $this->handler->handle(new ShowBranchQuery($branchId, $actor->scopedBrandIds(), $actor->scopedBranchIds()));

        return $branch;
    }
}
