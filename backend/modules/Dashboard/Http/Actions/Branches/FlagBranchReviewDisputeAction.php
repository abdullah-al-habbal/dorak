<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Handlers\Staff\FlagReviewDisputeHandler;
use Modules\Review\Http\Requests\Staff\FlagReviewDisputeRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;
use Modules\Review\Models\ReviewModel;

/**
 * NS-14: a branch manager or brand owner flags a published review of their branch for the platform
 * team (NS-05). The branch comes from the URL and is resolved inside the actor's scope, and the review
 * must be about that branch, so a review of another branch answers 404. The platform admin judges
 * disputes and is not a party to one.
 */
final class FlagBranchReviewDisputeAction extends BaseApiAction
{
    public function __construct(
        private readonly ScopedBranchResolver $branches,
        private readonly FlagReviewDisputeHandler $handler,
    ) {}

    public function __invoke(FlagReviewDisputeRequest $request, string $branch, string $review): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.review.file');

        $scoped = $this->branches->resolve($request, $branch);
        ReviewModel::query()
            ->whereKey($review)
            ->where('subject_type', ReviewSubjectTypeEnum::Branch)
            ->where('subject_id', $scoped->getKey())
            ->firstOrFail();

        $result = $this->handler->handle($request->toCommand($review, ReviewSubjectTypeEnum::Branch, (string) $scoped->getKey()));
        if ($result->review === null) {
            return $this->error(
                code: 'REVIEW_VALIDATION_FAILED',
                message: __("review::messages.{$result->errorCode}"),
                status: 422,
            );
        }

        return $this->updated(new ReviewResource($result->review), message: __('review::messages.dispute_flagged'));
    }
}
