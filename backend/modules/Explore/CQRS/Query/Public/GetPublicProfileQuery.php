<?php

declare(strict_types=1);

namespace Modules\Explore\CQRS\Query\Public;

final readonly class GetPublicProfileQuery
{
    public function __construct(
        public string $slug,
    ) {}
}
