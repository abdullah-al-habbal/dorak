<?php

declare(strict_types=1);

namespace Modules\Booking\CQRS\Command\Client;

use Carbon\Carbon;

final readonly class CreateBookingCommand
{
    public function __construct(
        public ?string $chairId,
        public ?string $barberId,
        public string $clientId,
        public Carbon $startsAt,
        public array $serviceIds,
        public ?array $homeAddress,
        public ?string $branchId = null,
        public ?string $idempotencyKey = null,
    ) {}

    /** Fingerprint of what is being asked for, so a reused idempotency key with another request is noticed. */
    public function requestHash(): string
    {
        $serviceIds = $this->serviceIds;
        sort($serviceIds);
        $homeAddress = $this->homeAddress;
        if ($homeAddress !== null) {
            ksort($homeAddress);
        }

        return hash('sha256', json_encode([
            'chair_id' => $this->chairId,
            'barber_id' => $this->barberId,
            'branch_id' => $this->branchId,
            'starts_at' => $this->startsAt->copy()->utc()->format('Y-m-d\TH:i:s.u\Z'),
            'service_ids' => $serviceIds,
            'home_address' => $homeAddress,
        ], JSON_THROW_ON_ERROR));
    }
}
