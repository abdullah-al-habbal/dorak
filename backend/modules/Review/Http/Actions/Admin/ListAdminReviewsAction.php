<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Http\Requests\Admin\ListAdminReviewsRequest;
use Modules\Review\Http\Resources\Admin\AdminReviewResource;
use Modules\Review\Models\ReviewModel;

final class ListAdminReviewsAction extends BaseApiAction
{
    public function __invoke(ListAdminReviewsRequest $request): JsonResponse
    {
        $reviews = ReviewModel::query()
            ->where('status', $request->status())
            ->with('author')
            ->orderByDesc('disputed_at')
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($reviews, AdminReviewResource::class);
    }
}
