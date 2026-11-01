<?php

declare(strict_types=1);

namespace Modules\Preference\CQRS\Query;

use Modules\Preference\Enums\PreferenceableTypeEnum;

final readonly class GetSettingsQuery
{
    public function __construct(
        public PreferenceableTypeEnum $ownerType,
        public string $ownerId,
    ) {}
}
