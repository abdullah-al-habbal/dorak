<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Constants\PaginationConstants;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBranchQuery;
use Modules\Dashboard\Handlers\Branches\ShowBranchHandler;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Review\Http\Resources\Shared\ReviewResource;
use Modules\Review\Models\ReviewModel;

final class ListBranchReviewsAction extends BaseApiAction
{
    public function __construct(private readonly ShowBranchHandler $handler) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var BranchModel $model */
        $model = $this->handler->handle(new ShowBranchQuery($branch, $actor->scopedBrandIds(), $actor->scopedBranchIds()));
        $perPage = min(max($request->integer('per_page', PaginationConstants::PAGINATION_DEFAULT_PER_PAGE), 1), PaginationConstants::PAGINATION_MAX_PER_PAGE);

        $reviews = ReviewModel::query()
            ->where('subject_id', $model->getKey())
            ->whereIn('subject_type', ['branch', BranchModel::class])
            ->with('author')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginated($reviews, ReviewResource::class);
    }
}
