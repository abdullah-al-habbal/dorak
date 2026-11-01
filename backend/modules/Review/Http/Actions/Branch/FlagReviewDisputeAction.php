<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Handlers\Staff\FlagReviewDisputeHandler;
use Modules\Review\Http\Requests\Staff\FlagReviewDisputeRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

final class FlagReviewDisputeAction extends BaseApiAction
{
    public function __construct(private readonly FlagReviewDisputeHandler $handler) {}

    public function __invoke(FlagReviewDisputeRequest $request, string $review): JsonResponse
    {
        $subjectId = (string) $request->user('branch_api')?->getKey();
        $result = $this->handler->handle($request->toCommand($review, ReviewSubjectTypeEnum::Branch, $subjectId));

        if ($result->review === null) {
            return $this->error(
                code: 'REVIEW_VALIDATION_FAILED',
                message: __("review::messages.{$result->errorCode}"),
                status: $result->errorCode === 'dispute_not_reviewed_party' ? 403 : 422,
            );
        }

        return $this->ok(data: new ReviewResource($result->review), message: __('review::messages.dispute_flagged'));
    }
}
