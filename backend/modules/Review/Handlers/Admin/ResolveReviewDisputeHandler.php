<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Admin;

use Carbon\Carbon;
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

        $disputedAt = $review->getAttribute('disputed_at');

        if ($review->getAttribute('status') !== ReviewStatus::Disputed || ! $disputedAt instanceof Carbon || $disputedAt->greaterThan(now()->subHours(48))) {
            return null;
        }

        $review->update(['status' => $command->status, 'resolved_at' => now(), 'resolved_by' => $command->adminId]);

        return $review->fresh('author');
    }
}
