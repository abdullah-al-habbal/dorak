<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Http\Resources\Shared\ReviewResource;
use Modules\Review\Models\ReviewModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListBranchReviewsAction extends BaseApiAction
{
    public function __construct(private readonly ShowBranchHandler $handler) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $model */
        $model = $this->handler->handle(new ShowBranchQuery($branch, $actor->scopedBrandIds(), $actor->scopedBranchIds()));
        $perPage = min(max($request->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage)), 1), app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage));

        $reviews = ReviewModel::query()
            ->where('subject_id', $model->getKey())
            ->where('subject_type', ReviewSubjectTypeEnum::Branch)
            ->with('author')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginated($reviews, ReviewResource::class);
    }
}
