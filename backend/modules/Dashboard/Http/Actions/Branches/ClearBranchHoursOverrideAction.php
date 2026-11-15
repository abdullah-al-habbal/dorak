<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Services\BranchHours;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** NS-12: removes a date's exception, so the weekly hours apply again. */
final class ClearBranchHoursOverrideAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BrandFeatures $brandFeatures,
        private readonly BranchHours $hours,
    ) {}

    public function __invoke(Request $request, string $branch, string $date): JsonResponse
    {
        $scoped = $this->branches->resolveForWrite($request, $branch);
        $this->brandFeatures->ensureBranchManageable($scoped->getKey());

        $this->hours->clearOverride($scoped, $date);

        return $this->updated(['date' => $date]);
    }
}
