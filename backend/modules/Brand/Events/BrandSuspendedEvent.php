<?php

declare(strict_types=1);

namespace Modules\Brand\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Modules\Brand\Constants\BrandBroadcastConstants;
use Modules\Brand\Enums\BrandStatusEnum;

/**
 * Tells a suspended brand's signed-in apps at once: each enabled branch on its own private
 * channel and the owner on their client channel. The payload carries no reason or account data;
 * the HTTP answers (`ACCOUNT_NOT_ACTIVE`, `brand_suspended`) stay authoritative.
 */
final class BrandSuspendedEvent implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable;

    /** @param list<string> $branchIds */
    public function __construct(
        public readonly string $brandId,
        private readonly array $branchIds,
        private readonly ?string $ownerId,
    ) {}

    /** @return list<PrivateChannel> */
    public function broadcastOn(): array
    {
        $channels = array_map(
            fn (string $branchId): PrivateChannel => new PrivateChannel(BrandBroadcastConstants::BRAND_PRIVATE_BRANCH_CHANNEL_PREFIX.$branchId),
            $this->branchIds,
        );

        if ($this->ownerId !== null) {
            $channels[] = new PrivateChannel(BrandBroadcastConstants::BRAND_PRIVATE_CLIENT_CHANNEL_PREFIX.$this->ownerId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return BrandBroadcastConstants::BRAND_SUSPENDED_EVENT_NAME;
    }

    /** @return array{brandId: string, status: string} */
    public function broadcastWith(): array
    {
        return ['brandId' => $this->brandId, 'status' => BrandStatusEnum::Suspended->value];
    }
}
