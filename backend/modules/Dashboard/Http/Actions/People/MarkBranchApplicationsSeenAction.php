<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Services\ApplicationSeenMarker;

/** Marks the posting's new applications as seen. Idempotent; it never touches an application past `submitted`. */
final class MarkBranchApplicationsSeenAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly ApplicationSeenMarker $marker,
    ) {}

    public function __invoke(Request $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForStaffing($request, $branch);
        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);

        return $this->updated(data: ['updated' => $this->marker->markSeen((string) $posting->getKey())]);
    }
}
