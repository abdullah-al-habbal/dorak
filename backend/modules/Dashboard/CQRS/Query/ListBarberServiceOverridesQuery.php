<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListBarberServiceOverridesQuery
{
    public function __construct(
        public string $barberId,
        public string $brandId,
    ) {}
}
