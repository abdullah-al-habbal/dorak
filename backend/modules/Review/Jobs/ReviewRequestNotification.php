<?php

declare(strict_types=1);

namespace Modules\Review\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class ReviewRequestNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so the client gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $bookingId,
        private readonly string $locale = 'en',
    ) {
        $this->dispatchKey = (string) Str::uuid();
    }

    public function handle(FcmNotificationSender $sender): void
    {
        $booking = BookingModel::query()->with('chair')->find($this->bookingId);
        // Submission needs a completed booking with a branch or a barber to review (Task 39).
        $hasSubject = ($booking?->branch_id ?? $booking?->chair?->branch_id) !== null || $booking?->barber_id !== null;
        if ($booking === null || $booking->booking_status !== BookingStatus::Completed || ! $hasSubject) {
            return;
        }

        $sender->sendTo(
            ClientModel::class,
            (string) $booking->client_id,
            NotificationTypeEnum::ReviewRequest,
            trans('review::messages.notification_review_request_title', [], $this->locale),
            trans('review::messages.notification_review_request_body', [], $this->locale),
            ['type' => NotificationTypeEnum::ReviewRequest->value, 'event' => 'review_request', 'booking_id' => $booking->id],
            $this->dispatchKey,
        );
    }
}
