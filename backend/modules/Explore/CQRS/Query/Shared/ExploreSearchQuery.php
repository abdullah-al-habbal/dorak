<?php

declare(strict_types=1);

namespace Modules\Explore\CQRS\Query\Shared;

final readonly class ExploreSearchQuery
{
    public function __construct(
        public ExploreBranchesQuery $branches,
        public ExploreBarbersQuery $barbers,
        public int $page,
        public int $perPage,
    ) {}
}
