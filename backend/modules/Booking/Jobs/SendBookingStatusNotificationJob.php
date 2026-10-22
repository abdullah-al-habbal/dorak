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
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Services\FcmNotificationSender;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class SendBookingStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $bookingId,
        private readonly bool $created,
        private readonly string $locale = 'en',
        private readonly bool $rescheduled = false,
    ) {}

    public function handle(FcmNotificationSender $sender): void
    {
        $booking = BookingModel::query()->with('chair')->find($this->bookingId);
        if ($booking === null) {
            return;
        }

        $data = ['type' => 'booking_status', 'booking_id' => $booking->id, 'status' => $booking->status->value];
        if ($this->created) {
            if ($booking->barber_id !== null) {
                $sender->sendTo(BarberModel::class, $booking->barber_id, trans('booking::messages.notification_new_request_title', [], $this->locale), trans('booking::messages.notification_barber_request_body', [], $this->locale), $data);
            }
            $branchId = $booking->chair?->branch_id;
            if ($branchId !== null) {
                $sender->sendTo(BranchModel::class, $branchId, trans('booking::messages.notification_new_request_title', [], $this->locale), trans('booking::messages.notification_branch_request_body', [], $this->locale), $data);
            }

            return;
        }
        if ($this->rescheduled) {
            $data = ['type' => 'booking_rescheduled', 'booking_id' => $booking->id, 'status' => $booking->status->value, 'time_slot' => $booking->time_slot->toIso8601String()];
            $sender->sendTo(ClientModel::class, $booking->client_id, trans('booking::messages.notification_rescheduled_title', [], $this->locale), trans('booking::messages.notification_rescheduled_body', ['time' => $booking->time_slot->toDateTimeString()], $this->locale), $data);

            return;
        }
        $sender->sendTo(ClientModel::class, $booking->client_id, trans('booking::messages.notification_status_title', [], $this->locale), trans('booking::messages.notification_status_body', ['status' => $booking->status->value], $this->locale), $data);
    }
}
