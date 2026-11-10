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
        public string $baseCurrencyCode,
        public ?string $logoUrl,
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

    /** @param array<string, mixed> $brand the validated brand payload (see `BrandPayloadRules`) */
    public static function fromPayload(string $ownerId, array $brand): self
    {
        $latitude = data_get($brand, 'first_branch.latitude');
        $longitude = data_get($brand, 'first_branch.longitude');

        return new self(
            ownerId: $ownerId,
            nameEn: (string) data_get($brand, 'name.en'),
            nameAr: (string) data_get($brand, 'name.ar'),
            baseCurrencyCode: (string) ($brand['base_currency_code'] ?? ''),
            logoUrl: $brand['logo_url'] ?? null,
            descriptionEn: data_get($brand, 'description.en'),
            descriptionAr: data_get($brand, 'description.ar'),
            universe: VenueUniverse::tryFrom((string) ($brand['universe'] ?? '')) ?? VenueUniverse::Unisex,
            firstBranchNameEn: data_get($brand, 'first_branch.name.en'),
            firstBranchNameAr: data_get($brand, 'first_branch.name.ar'),
            firstBranchLatitude: $latitude === null ? null : (float) $latitude,
            firstBranchLongitude: $longitude === null ? null : (float) $longitude,
            firstBranchEmail: data_get($brand, 'first_branch.email'),
            firstBranchPassword: data_get($brand, 'first_branch.password'),
        );
    }
}
