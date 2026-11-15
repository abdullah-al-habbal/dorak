<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\UpdateBranchHoursOverrideRequest;
use Modules\Dashboard\Http\Resources\Shared\BranchHoursOverrideResource;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** NS-12: closes a day or sets special hours; setting a date again replaces its earlier exception. */
final class SetBranchHoursOverrideAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(UpdateBranchHoursOverrideRequest $request, string $branch, string $date): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scoped = $this->branches->resolve($request, $branch);
        Gate::forUser($actor)->authorize('dashboard.branch.updateHours', $scoped);
        $this->writeGuard->ensureBranchWritable($actor, $scoped);
        $this->brandFeatures->ensureBranchManageable($scoped->getKey());

        $override = $this->hours->setOverride($scoped, $date, $request->safe()->except('date'));

        return $this->updated(BranchHoursOverrideResource::make($override));
    }
}
