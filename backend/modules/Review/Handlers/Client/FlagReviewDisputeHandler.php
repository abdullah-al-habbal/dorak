<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Client;

use Modules\Review\CQRS\Command\Client\FlagReviewDisputeCommand;
use Modules\Review\Eloquent\Resolvers\Shared\ManageReviewDisputeEloquentResolver;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

final class FlagReviewDisputeHandler
{
    public function __construct(private readonly ManageReviewDisputeEloquentResolver $resolver) {}

    public function handle(FlagReviewDisputeCommand $command): ?ReviewModel
    {
        $review = $this->resolver->find($command->reviewId);

        if ($review->getAttribute('author_id') !== $command->clientId || $review->getAttribute('status') !== ReviewStatus::Published) {
            return null;
        }

        $review->update(['status' => ReviewStatus::Disputed, 'dispute_reason' => $command->reason, 'disputed_at' => now()]);

        return $review->fresh('author');
    }
}
