<?php

declare(strict_types=1);

namespace Modules\Currency\ValuesObjects;

final readonly class DisplayPriceResult
{
    public function __construct(
        public ?float $amount,
        public string $currencyCode,
        public bool $conversionUnavailable,
        public bool $dualPriceDisplay,
    ) {}

    /** @return array{amount: float|null, currency_code: string} */
    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency_code' => $this->currencyCode,
        ];
    }
}
