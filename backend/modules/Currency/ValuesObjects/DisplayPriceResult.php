<?php

declare(strict_types=1);

namespace Modules\Currency\ValuesObjects;

final readonly class DisplayPriceResult
{
    public function __construct(
        public ?int $amountMinor,
        public string $currencyCode,
        public bool $conversionUnavailable,
        public bool $allowsDualPriceDisplay,
    ) {}

    /** @return array{amount_minor: int|null, currency_code: string} */
    public function toArray(): array
    {
        return [
            'amount_minor' => $this->amountMinor,
            'currency_code' => $this->currencyCode,
        ];
    }
}
