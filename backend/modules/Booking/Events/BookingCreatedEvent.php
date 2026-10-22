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

    public function __construct(public string $bookingId, public string $branchId, private ?string $clientId = null) {}

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('branch.'.$this->branchId)];
        if ($this->clientId !== null) {
            $channels[] = new PrivateChannel('client.'.$this->clientId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'booking.created';
    }
}
