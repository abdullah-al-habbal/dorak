<?php

declare(strict_types=1);

namespace Modules\Preference\CQRS\Command;

final readonly class UpdateSettingsCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(
        public string $ownerType,
        public string $ownerId,
        public array $attributes,
    ) {}
}
