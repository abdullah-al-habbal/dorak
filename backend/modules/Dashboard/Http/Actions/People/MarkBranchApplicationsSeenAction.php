<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/** Marks the posting's new applications as seen. Idempotent; it never touches an application past `submitted`. */
final class MarkBranchApplicationsSeenAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForTeam($request, $branch);
        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);

        $updated = ApplicationModel::where('job_posting_id', $posting->getKey())
            ->where('status', ApplicationStatus::Submitted)
            ->update(['status' => ApplicationStatus::Seen]);

        return $this->updated(data: ['updated' => $updated]);
    }
}
