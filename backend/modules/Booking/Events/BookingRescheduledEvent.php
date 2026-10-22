<?php

declare(strict_types=1);

namespace Modules\Booking\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class BookingRescheduledEvent implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $bookingId, public string $branchId, public ?string $barberId, public string $timeSlot) {}

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('branch.'.$this->branchId)];
        if ($this->barberId !== null) {
            $channels[] = new PrivateChannel('barber.'.$this->barberId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'booking.rescheduled';
    }
}
