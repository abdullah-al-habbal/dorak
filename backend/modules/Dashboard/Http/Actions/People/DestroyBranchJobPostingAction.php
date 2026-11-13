<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Models\JobPostingModel;

/** Deleting stays available after a plan downgrade so stale postings can be cleaned up. */
final class DestroyBranchJobPostingAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForStaffing($request, $branch);
        JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting)->delete();

        return $this->noContent(SuccessCodeEnum::DELETED);
    }
}
