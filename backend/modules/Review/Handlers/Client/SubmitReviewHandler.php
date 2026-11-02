<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Client;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Review\CQRS\Command\Client\SubmitReviewCommand;
use Modules\Review\Eloquent\Resolvers\Client\SubmitReviewEloquentResolver;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\ValuesObjects\SubmitReviewResult;

/**
 * A client reviews a completed booking once. The subjects are the booking's
 * branch (`branch_id`, or the chair's branch for legacy rows) and its barber:
 * an in-shop booking with a barber yields one review for each, an at-home or
 * barber-only booking yields a barber review, and a booking with neither has
 * no subject.
 */
final class SubmitReviewHandler
{
    public function __construct(
        private readonly SubmitReviewEloquentResolver $resolver,
    ) {}

    public function handle(SubmitReviewCommand $command): SubmitReviewResult
    {
        return DB::transaction(function () use ($command): SubmitReviewResult {
            $booking = $this->resolver->findBookingForReview($command->bookingId);

            if ($booking->client_id !== $command->authorId) {
                return SubmitReviewResult::notOwnBooking();
            }

            if ($booking->booking_status !== BookingStatus::Completed) {
                return SubmitReviewResult::bookingNotCompleted();
            }

            if ($this->resolver->authorHasReviewed($booking, $command->authorId, $command->authorType)) {
                return SubmitReviewResult::alreadyReviewed();
            }

            $branchId = $this->branchIdOf($booking);
            $barberId = $booking->getAttribute('barber_id');
            $barberId = is_string($barberId) && $barberId !== '' ? $barberId : null;

            if ($branchId === null && $barberId === null) {
                return SubmitReviewResult::noSubject();
            }

            $barberReview = $barberId === null ? null : $this->resolver->createReview([
                ...$this->baseAttributes($booking, $command),
                'subject_id' => $barberId,
                'subject_type' => ReviewSubjectTypeEnum::Barber,
                'rating' => $branchId === null ? $command->rating : ($command->barberRating ?? $command->rating),
            ]);

            if ($branchId === null && $barberReview !== null) {
                return SubmitReviewResult::success($barberReview);
            }

            $branchReview = $this->resolver->createReview([
                ...$this->baseAttributes($booking, $command),
                'subject_id' => $branchId,
                'subject_type' => ReviewSubjectTypeEnum::Branch,
                'rating' => $command->rating,
            ]);

            return SubmitReviewResult::success($branchReview, $barberReview);
        });
    }

    private function branchIdOf(BookingModel $booking): ?string
    {
        $branchId = $booking->getAttribute('branch_id') ?? $booking->chair?->getAttribute('branch_id');

        return is_string($branchId) && $branchId !== '' ? $branchId : null;
    }

    /** @return array<string, mixed> */
    private function baseAttributes(BookingModel $booking, SubmitReviewCommand $command): array
    {
        return [
            'booking_id' => $booking->id,
            'author_id' => $command->authorId,
            'author_type' => $command->authorType,
            'body' => $command->body,
        ];
    }
}
