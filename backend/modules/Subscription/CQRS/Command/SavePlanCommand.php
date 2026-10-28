<?php

declare(strict_types=1);

namespace Modules\Subscription\CQRS\Command;

final readonly class SavePlanCommand
{
    /**
     * @param  array<string, string>  $name
     * @param  array<string, string>|null  $description
     * @param  list<string>  $featureKeys
     */
    public function __construct(
        public array $name,
        public ?array $description,
        public int $priceMinor,
        public string $currencyId,
        public string $intervalUnit,
        public int $intervalCount,
        public bool $isActive,
        public int $sortOrder,
        public array $featureKeys,
    ) {}
}
