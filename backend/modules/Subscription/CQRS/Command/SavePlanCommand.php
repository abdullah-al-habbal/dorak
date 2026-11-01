<?php

declare(strict_types=1);

namespace Modules\Subscription\CQRS\Command;

use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;

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
        public string $currencyCode,
        public SubscriptionIntervalUnitEnum $intervalUnit,
        public int $intervalCount,
        public bool $isActive,
        public int $sortOrder,
        public array $featureKeys,
    ) {}
}
