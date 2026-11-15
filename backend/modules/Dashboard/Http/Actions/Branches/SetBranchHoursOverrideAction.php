<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\UpdateBranchHoursOverrideRequest;
use Modules\Dashboard\Http\Resources\Shared\BranchHoursOverrideResource;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** NS-12: closes a day or sets special hours; setting a date again replaces its earlier exception. */
final class SetBranchHoursOverrideAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(UpdateBranchHoursOverrideRequest $request, string $branch, string $date): JsonResponse
    {
        $scoped = $this->branches->resolveForWrite($request, $branch);
        $this->brandFeatures->ensureBranchManageable($scoped->getKey());

        $override = $this->hours->setOverride($scoped, $date, $request->safe()->except('date'));

        return $this->updated(BranchHoursOverrideResource::make($override));
    }
}
