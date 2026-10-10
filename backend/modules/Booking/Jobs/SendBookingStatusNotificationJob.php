<?php

declare(strict_types=1);

namespace Modules\Booking\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Services\FcmNotificationSender;

final class SendBookingStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly string $bookingId, private readonly bool $created) {}

    public function handle(FcmNotificationSender $sender): void
    {
        $booking = BookingModel::query()->with('chair')->find($this->bookingId);
        if ($booking === null) {
            return;
        }

        $data = ['type' => 'booking_status', 'booking_id' => $booking->id, 'status' => $booking->status->value];
        if ($this->created) {
            if ($booking->barber_id !== null) {
                $sender->sendTo(BarberModel::class, $booking->barber_id, 'New booking request', 'A booking requires your attention.', $data);
            }
            $branchId = $booking->chair?->branch_id;
            if ($branchId !== null) {
                $sender->sendTo(BranchModel::class, $branchId, 'New booking request', 'A booking requires branch attention.', $data);
            }

            return;
        }
        $sender->sendTo(ClientModel::class, $booking->client_id, 'Booking status updated', "Your booking is now {$booking->status->value}.", $data);
    }
}
