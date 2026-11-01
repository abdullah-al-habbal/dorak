<?php

declare(strict_types=1);

namespace Modules\Preference\CQRS\Command;

use Modules\Preference\Enums\PreferenceableTypeEnum;

final readonly class UpdateSettingsCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(
        public PreferenceableTypeEnum $ownerType,
        public string $ownerId,
        public array $attributes,
    ) {}
}
