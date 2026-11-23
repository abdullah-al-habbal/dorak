<?php

declare(strict_types=1);

namespace Modules\Booking\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;
use Modules\Core\Services\LocalizedNotificationMessage;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class SendBookingStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so each recipient gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $bookingId,
        private readonly bool $created,
        private readonly string $locale = 'en',
        private readonly bool $rescheduled = false,
        private readonly bool $actorIsClient = false,
    ) {
        $this->dispatchKey = (string) Str::uuid();
    }

    public function handle(FcmNotificationSender $sender): void
    {
        $booking = BookingModel::query()->with('chair')->find($this->bookingId);
        if ($booking === null) {
            return;
        }

        $data = ['type' => 'booking_status', 'booking_id' => $booking->id, 'status' => $booking->booking_status->value];
        if ($this->created) {
            if ($booking->barber_id !== null) {
                $sender->sendMessage(BarberModel::class, $booking->barber_id, NotificationTypeEnum::BookingUpdate, LocalizedNotificationMessage::translated('booking::messages.notification_new_request_title', 'booking::messages.notification_barber_request_body'), $data, $this->dispatchKey);
            }
            $branchId = $booking->chair?->branch_id;
            if ($branchId !== null) {
                $sender->sendMessage(BranchModel::class, $branchId, NotificationTypeEnum::BookingUpdate, LocalizedNotificationMessage::translated('booking::messages.notification_new_request_title', 'booking::messages.notification_branch_request_body'), $data, $this->dispatchKey);
            }

            return;
        }
        if ($this->actorIsClient) {
            $this->notifyStaff($sender, $booking, $data);

            return;
        }
        if ($this->rescheduled) {
            $data = ['type' => 'booking_rescheduled', 'booking_id' => $booking->id, 'status' => $booking->booking_status->value, 'starts_at' => $booking->starts_at->toIso8601String()];
            $sender->sendMessage(ClientModel::class, $booking->client_id, NotificationTypeEnum::BookingUpdate, LocalizedNotificationMessage::translated('booking::messages.notification_rescheduled_title', 'booking::messages.notification_rescheduled_body', ['time' => $booking->starts_at->toDateTimeString()]), $data, $this->dispatchKey);

            return;
        }
        $sender->sendMessage(ClientModel::class, $booking->client_id, NotificationTypeEnum::BookingUpdate, LocalizedNotificationMessage::translated('booking::messages.notification_status_title', 'booking::messages.notification_status_body', ['status' => $booking->booking_status->value]), $data, $this->dispatchKey);
    }

    /**
     * The client made the change themselves, so tell the people who serve the
     * booking instead of echoing the action back to the client.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     */
    private function notifyStaff(FcmNotificationSender $sender, BookingModel $booking, array $data): void
    {
        $message = LocalizedNotificationMessage::translated('booking::messages.notification_status_title', 'booking::messages.notification_client_changed_body', ['status' => $booking->booking_status->value]);
        if ($booking->barber_id !== null) {
            $sender->sendMessage(BarberModel::class, $booking->barber_id, NotificationTypeEnum::BookingUpdate, $message, $data, $this->dispatchKey);
        }
        $branchId = $booking->branch_id ?? $booking->chair?->branch_id;
        if ($branchId !== null) {
            $sender->sendMessage(BranchModel::class, $branchId, NotificationTypeEnum::BookingUpdate, $message, $data, $this->dispatchKey);
        }
    }
}
