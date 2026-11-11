<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Http\Resources\Barber\ApplicationResource;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/** Read-only: marking applications as seen is its own call (`MarkBranchApplicationsSeenAction`). */
final class ListBranchApplicationsAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch, string $jobPosting): JsonResponse
    {
        $model = $this->branches->resolveForTeam($request, $branch);
        $posting = JobPostingModel::where('branch_id', $model->getKey())->findOrFail($jobPosting);

        return $this->paginated(
            ApplicationModel::where('job_posting_id', $posting->getKey())->orderByDesc('created_at')->paginate(app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage)),
            ApplicationResource::class,
        );
    }
}
