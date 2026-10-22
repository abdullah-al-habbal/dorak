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

        $data = ['type' => 'booking_status', 'booking_id' => $booking->id, 'status' => $booking->status->value];
        if ($this->created) {
            if ($booking->barber_id !== null) {
                $sender->sendTo(BarberModel::class, $booking->barber_id, NotificationTypeEnum::BookingUpdate, trans('booking::messages.notification_new_request_title', [], $this->locale), trans('booking::messages.notification_barber_request_body', [], $this->locale), $data, $this->dispatchKey);
            }
            $branchId = $booking->chair?->branch_id;
            if ($branchId !== null) {
                $sender->sendTo(BranchModel::class, $branchId, NotificationTypeEnum::BookingUpdate, trans('booking::messages.notification_new_request_title', [], $this->locale), trans('booking::messages.notification_branch_request_body', [], $this->locale), $data, $this->dispatchKey);
            }

            return;
        }
        if ($this->actorIsClient) {
            $this->notifyStaff($sender, $booking, $data);

            return;
        }
        if ($this->rescheduled) {
            $data = ['type' => 'booking_rescheduled', 'booking_id' => $booking->id, 'status' => $booking->status->value, 'time_slot' => $booking->time_slot->toIso8601String()];
            $sender->sendTo(ClientModel::class, $booking->client_id, NotificationTypeEnum::BookingUpdate, trans('booking::messages.notification_rescheduled_title', [], $this->locale), trans('booking::messages.notification_rescheduled_body', ['time' => $booking->time_slot->toDateTimeString()], $this->locale), $data, $this->dispatchKey);

            return;
        }
        $sender->sendTo(ClientModel::class, $booking->client_id, NotificationTypeEnum::BookingUpdate, trans('booking::messages.notification_status_title', [], $this->locale), trans('booking::messages.notification_status_body', ['status' => $booking->status->value], $this->locale), $data, $this->dispatchKey);
    }

    /**
     * The client made the change themselves, so tell the people who serve the
     * booking instead of echoing the action back to the client.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     */
    private function notifyStaff(FcmNotificationSender $sender, BookingModel $booking, array $data): void
    {
        $title = trans('booking::messages.notification_status_title', [], $this->locale);
        $body = trans('booking::messages.notification_client_changed_body', ['status' => $booking->status->value], $this->locale);
        if ($booking->barber_id !== null) {
            $sender->sendTo(BarberModel::class, $booking->barber_id, NotificationTypeEnum::BookingUpdate, $title, $body, $data, $this->dispatchKey);
        }
        $branchId = $booking->branch_id ?? $booking->chair?->branch_id;
        if ($branchId !== null) {
            $sender->sendTo(BranchModel::class, $branchId, NotificationTypeEnum::BookingUpdate, $title, $body, $data, $this->dispatchKey);
        }
    }
}
