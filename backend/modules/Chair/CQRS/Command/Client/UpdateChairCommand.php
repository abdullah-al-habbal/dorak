<?php

declare(strict_types=1);

namespace Modules\Chair\CQRS\Command\Client;

use Modules\Chair\Enums\FloorZone;

final readonly class UpdateChairCommand
{
    public function __construct(
        public string $chairId,
        public ?string $label,
        public ?string $status,
        public ?string $barberId,
        public bool $barberIdProvided,
        public ?FloorZone $floorZone,
        public ?array $uiMetadata,
        public bool $force = false,
    ) {}
}
