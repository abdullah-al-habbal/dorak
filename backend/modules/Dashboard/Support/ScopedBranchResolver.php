<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Auth\Access\AuthorizationException;
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

    /**
     * Like `resolve`, for the operations the shop's own team performs (the job board): a platform
     * administrator is refused, matching the proxy allow-list's manager and owner guards.
     */
    public function resolveForTeam(Request $request, string $branchId): BranchModel
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        if ($actor->isPlatformAdmin()) {
            throw new AuthorizationException(__('dashboard::messages.branch_team_only'));
        }

        return $this->resolve($request, $branchId);
    }
}
