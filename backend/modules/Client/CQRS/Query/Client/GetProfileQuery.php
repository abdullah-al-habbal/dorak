<?php

declare(strict_types=1);

namespace Modules\Client\CQRS\Query\Client;

final readonly class GetProfileQuery
{
    public function __construct(
        public string $clientId,
    ) {}
}
