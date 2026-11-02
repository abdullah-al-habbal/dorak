<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Admin;

use Modules\Review\CQRS\Command\Admin\ResolveReviewDisputeCommand;
use Modules\Review\Eloquent\Resolvers\Shared\ManageReviewDisputeEloquentResolver;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

final class ResolveReviewDisputeHandler
{
    public function __construct(private readonly ManageReviewDisputeEloquentResolver $resolver) {}

    public function handle(ResolveReviewDisputeCommand $command): ?ReviewModel
    {
        $review = $this->resolver->find($command->reviewId);

        // Admins decide at any time while the review is disputed; disputes
        // nobody decides within 48 hours are re-published by
        // `reviews:release-expired-disputes`.
        if ($review->getAttribute('status') !== ReviewStatus::Disputed) {
            return null;
        }

        $review->update(['status' => $command->status, 'resolved_at' => now(), 'resolved_by_id' => $command->adminId, 'resolution_note' => $command->note]);

        return $review->fresh('author');
    }
}
