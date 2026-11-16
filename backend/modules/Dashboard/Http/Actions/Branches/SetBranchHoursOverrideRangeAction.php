<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\SetBranchHoursOverrideRangeRequest;
use Modules\Dashboard\Http\Resources\Shared\BranchHoursOverrideResource;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** FT-8: closes or shortens every day of a date range, optionally only on some weekdays. */
final class SetBranchHoursOverrideRangeAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(SetBranchHoursOverrideRangeRequest $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scoped = $this->branches->resolve($request, $branch);
        Gate::forUser($actor)->authorize('dashboard.branch.updateHours', $scoped);
        $this->writeGuard->ensureBranchWritable($actor, $scoped);
        $this->brandFeatures->ensureBranchManageable($scoped->getKey());

        $saved = $this->hours->setOverrideRange(
            $scoped,
            $request->validated('date_from'),
            $request->validated('date_to'),
            $request->weekdays(),
            $request->safe()->only(['is_closed', 'opens_time', 'closes_time']),
        );

        return $this->updated(BranchHoursOverrideResource::collection($saved));
    }
}
