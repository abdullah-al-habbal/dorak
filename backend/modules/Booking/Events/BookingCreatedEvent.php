<?php

declare(strict_types=1);

namespace Modules\Booking\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class BookingCreatedEvent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $bookingId, public string $branchId) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('branch.'.$this->branchId)];
    }

    public function broadcastAs(): string
    {
        return 'booking.created';
    }
}
