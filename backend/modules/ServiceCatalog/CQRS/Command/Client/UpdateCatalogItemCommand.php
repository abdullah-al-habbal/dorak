<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\CQRS\Command\Client;

use Modules\ServiceCatalog\Enums\FormalityEnum;
use Modules\ServiceCatalog\Enums\MaintenanceLevelEnum;
use Modules\ServiceCatalog\Enums\StylePeriodEnum;

final readonly class UpdateCatalogItemCommand
{
    public function __construct(
        public string $id,
        public ?string $categoryId,
        public ?array $name,
        public ?array $description,
        public ?string $slug,
        public ?string $sku,
        public ?array $priceRange,
        public ?MaintenanceLevelEnum $maintenanceLevel,
        public ?StylePeriodEnum $stylePeriodType,
        public ?FormalityEnum $formalityLevel,
        public ?array $faceShapes,
        public ?array $hairTextures,
        public ?array $metadata,
        public ?bool $isActive,
        public ?int $defaultDurationMinutes = null,
        public ?array $tagIds = null,
    ) {}
}
