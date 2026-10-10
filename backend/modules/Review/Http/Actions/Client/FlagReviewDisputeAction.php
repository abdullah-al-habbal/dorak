<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Handlers\Client\FlagReviewDisputeHandler;
use Modules\Review\Http\Requests\Client\FlagReviewDisputeRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

final class FlagReviewDisputeAction extends BaseApiAction
{
    public function __construct(private readonly FlagReviewDisputeHandler $handler) {}

    public function __invoke(FlagReviewDisputeRequest $request, string $review): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand($review));

        if ($result === null) {
            return $this->error(message: __('review::messages.dispute_not_allowed'), status: 422);
        }

        return $this->ok(data: new ReviewResource($result), message: __('review::messages.dispute_flagged'));
    }
}
