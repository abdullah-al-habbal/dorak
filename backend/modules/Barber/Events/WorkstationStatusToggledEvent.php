<?php

declare(strict_types=1);

namespace Modules\Barber\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class WorkstationStatusToggledEvent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $barberId, public bool $online) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('barber.'.$this->barberId)];
    }

    public function broadcastAs(): string
    {
        return 'workstation.status.toggled';
    }
}
