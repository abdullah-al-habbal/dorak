<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Query\Shared;

final readonly class GetBarberReviewsQuery
{
    public function __construct(
        public string $barberId,
        public int $perPage,
    ) {}
}
