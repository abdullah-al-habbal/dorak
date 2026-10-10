<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Handlers\Admin\ResolveReviewDisputeHandler;
use Modules\Review\Http\Requests\Admin\ResolveReviewDisputeRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

final class ResolveReviewDisputeAction extends BaseApiAction
{
    public function __construct(private readonly ResolveReviewDisputeHandler $handler) {}

    public function __invoke(ResolveReviewDisputeRequest $request, string $review): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand($review));

        if ($result === null) {
            return $this->error(message: __('review::messages.dispute_resolution_not_available'), status: 422);
        }

        return $this->ok(data: new ReviewResource($result), message: __('review::messages.dispute_resolved'));
    }
}
