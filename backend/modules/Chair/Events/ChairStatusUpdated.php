<?php

declare(strict_types=1);

namespace Modules\Chair\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\Chair\Constants\ChairBroadcastConstants;

final class ChairStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public string $chairId;

    public string $branchId;

    public string $status;

    public function __construct(string $chairId, string $branchId, string $status)
    {
        $this->chairId = $chairId;
        $this->branchId = $branchId;
        $this->status = $status;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel(ChairBroadcastConstants::FLOOR_PLAN_CHANNEL_PREFIX.$this->branchId);
    }

    public function broadcastAs(): string
    {
        return 'chair.status.updated';
    }
}
