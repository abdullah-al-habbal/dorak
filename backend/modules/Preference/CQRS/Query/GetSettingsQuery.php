<?php

declare(strict_types=1);

namespace Modules\Preference\CQRS\Query;

final readonly class GetSettingsQuery
{
    public function __construct(
        public string $ownerType,
        public string $ownerId,
    ) {}
}
