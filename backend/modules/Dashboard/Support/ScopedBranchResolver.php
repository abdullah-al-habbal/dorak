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
     * Like `resolve`, for the staffing operations (barber affiliations and the job board): the
     * platform admin, a branch manager and a brand owner may act, each inside their own scope;
     * anyone else is refused. Feature gates and lifecycle rules still apply to every actor.
     */
    public function resolveForStaffing(Request $request, string $branchId): BranchModel
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        if (! $actor->canManageStaffing()) {
            throw new AuthorizationException(__('dashboard::messages.staffing_not_permitted'));
        }

        return $this->resolve($request, $branchId);
    }
}
