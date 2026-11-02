<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Staff;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Review\CQRS\Command\Staff\ReviewClientCommand;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Modules\Review\ValuesObjects\ReviewClientResult;

/**
 * The provider side rates the client of a completed or no-show booking (F1).
 * A booking with a branch is rated by that branch (branch account, branch
 * manager or brand owner in the dashboard); a booking without a branch
 * (at-home, freelance) is rated by its barber. One client review per booking
 * and author side.
 */
final class ReviewClientHandler
{
    public function handle(ReviewClientCommand $command): ReviewClientResult
    {
        return DB::transaction(function () use ($command): ReviewClientResult {
            $booking = BookingModel::query()->with('chair')->lockForUpdate()->find($command->bookingId);
            if (! $booking instanceof BookingModel) {
                return ReviewClientResult::failure('not_own_booking');
            }

            $branchId = $booking->getAttribute('branch_id') ?? $booking->chair?->getAttribute('branch_id');
            $branchId = is_string($branchId) && $branchId !== '' ? $branchId : null;

            if ($command->authorSide === ReviewAuthorTypeEnum::Branch) {
                if ($branchId === null || ($command->branchScope !== null && ! in_array($branchId, $command->branchScope, true))) {
                    return ReviewClientResult::failure('not_own_booking');
                }
                $authorType = ReviewAuthorTypeEnum::Branch;
                $authorId = $branchId;
            } else {
                if ($command->barberId === null || $booking->getAttribute('barber_id') !== $command->barberId) {
                    return ReviewClientResult::failure('not_own_booking');
                }
                if ($branchId !== null) {
                    return ReviewClientResult::failure('branch_rates_client');
                }
                $authorType = ReviewAuthorTypeEnum::Barber;
                $authorId = $command->barberId;
            }

            if (! in_array($booking->booking_status, [BookingStatus::Completed, BookingStatus::NoShow], true)) {
                return ReviewClientResult::failure('booking_not_finished');
            }

            $alreadyReviewed = $booking->reviews()
                ->where('author_type', $authorType)
                ->where('subject_type', ReviewSubjectTypeEnum::Client)
                ->exists();
            if ($alreadyReviewed) {
                return ReviewClientResult::failure('already_reviewed');
            }

            $review = ReviewModel::query()->create([
                'booking_id' => $booking->id,
                'author_id' => $authorId,
                'author_type' => $authorType,
                'subject_id' => $booking->client_id,
                'subject_type' => ReviewSubjectTypeEnum::Client,
                'rating' => $command->rating,
                'comment' => $command->comment,
                'status' => ReviewStatus::Published,
            ]);

            return ReviewClientResult::success($review);
        });
    }
}
