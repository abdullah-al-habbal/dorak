<?php

declare(strict_types=1);

namespace Modules\Explore\CQRS\Query\Shared;

use Modules\Client\Enums\UniverseEnum;

final readonly class ExploreBarbersQuery
{
    public function __construct(
        public float $latitude,
        public float $longitude,
        public float $radius,
        public int $perPage,
        public ?array $catalogItemIds = null,
        public ?bool $availableNow = null,
        public ?int $priceRangeMin = null,
        public ?int $priceRangeMax = null,
        public ?float $ratingMin = null,
        public ?string $faceShapeCompatible = null,
        public ?string $clientId = null,
        public ?string $search = null,
        /** @var list<string>|null */
        public ?array $tagIds = null,
        public ?UniverseEnum $universe = null,
    ) {}
}
