<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Handlers\Staff\ReviewClientHandler;
use Modules\Review\Http\Requests\Staff\ReviewClientRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

final class ReviewClientAction extends BaseApiAction
{
    public function __construct(
        private readonly ReviewClientHandler $handler,
    ) {}

    public function __invoke(ReviewClientRequest $request, string $booking): JsonResponse
    {
        $branchId = (string) $request->user('branch_api')?->getKey();
        $result = $this->handler->handle($request->toCommand($booking, 'branch', null, [$branchId]));

        if ($result->review === null) {
            return $this->error(
                code: 'REVIEW_VALIDATION_FAILED',
                message: __("review::messages.{$result->errorCode}"),
                status: $result->status(),
            );
        }

        return $this->created(data: new ReviewResource($result->review), message: __('review::messages.client_reviewed'));
    }
}
