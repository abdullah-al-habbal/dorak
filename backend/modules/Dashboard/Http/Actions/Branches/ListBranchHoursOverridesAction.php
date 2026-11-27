<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Resources\Shared\BranchHoursOverrideResource;
use Modules\Dashboard\Support\ScopedBranchResolver;

/** NS-12: the branch's closure days and special hours from today on, soonest first. */
final class ListBranchHoursOverridesAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly BranchTimeZones $zones,
    ) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        $scoped = $this->branches->resolve($request, $branch);

        $overrides = BranchHoursOverrideModel::query()
            ->where('branch_id', $scoped->getKey())
            ->whereDate('override_date', '>=', $this->zones->today((string) $scoped->getKey()))
            ->orderBy('override_date')
            ->get();

        return $this->success(BranchHoursOverrideResource::collection($overrides));
    }
}
