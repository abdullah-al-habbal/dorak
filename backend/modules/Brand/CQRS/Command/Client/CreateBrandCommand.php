<?php

declare(strict_types=1);

namespace Modules\Brand\CQRS\Command\Client;

use Modules\Core\Enums\VenueUniverse;

final readonly class CreateBrandCommand
{
    public function __construct(
        public string $ownerId,
        public string $nameEn,
        public string $nameAr,
        public string $baseCurrencyId,
        public ?string $logo,
        public ?string $descriptionEn,
        public ?string $descriptionAr,
        public VenueUniverse $universe = VenueUniverse::Unisex,
        public ?string $firstBranchNameEn = null,
        public ?string $firstBranchNameAr = null,
        public ?float $firstBranchLatitude = null,
        public ?float $firstBranchLongitude = null,
        public ?string $firstBranchEmail = null,
        public ?string $firstBranchPassword = null,
    ) {}
}
