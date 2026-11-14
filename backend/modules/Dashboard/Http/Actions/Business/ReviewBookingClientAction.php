<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Handlers\Staff\ReviewClientHandler;
use Modules\Review\Http\Requests\Staff\ReviewClientRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

/**
 * Branch managers and brand owners rate a booking's client on behalf of the
 * booking's branch. The platform admin is not a party to the visit and cannot.
 */
final class ReviewBookingClientAction extends BaseApiAction
{
    public function __construct(private readonly ReviewClientHandler $handler) {}

    public function __invoke(ReviewClientRequest $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.review.file');

        $result = $this->handler->handle($request->toCommand($booking, ReviewAuthorTypeEnum::Branch, null, $actor->scopedBranchIds() ?? []));

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
