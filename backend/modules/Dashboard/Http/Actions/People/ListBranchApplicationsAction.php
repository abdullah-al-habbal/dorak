<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Constants\PaginationConstants;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

final class ListBranchApplicationsAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolve($request, $branch);
        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);

        ApplicationModel::where('job_posting_id', $posting->getKey())
            ->where('status', ApplicationStatus::Submitted)
            ->update(['status' => ApplicationStatus::Seen]);

        return $this->paginated(
            ApplicationModel::where('job_posting_id', $posting->getKey())->orderByDesc('created_at')->paginate(PaginationConstants::PAGINATION_DEFAULT_PER_PAGE),
            ApplicationResource::class,
        );
    }
}
