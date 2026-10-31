<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\JobPosting\Http\Resources\Shared\JobPostingResource;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListBranchJobPostingsAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        $model = $this->branches->resolve($request, $branch);

        return $this->paginated(
            JobPostingModel::where('branch_id', $model->getKey())->withCount('applications')->orderByDesc('created_at')->paginate(app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage)),
            JobPostingResource::class,
        );
    }
}
