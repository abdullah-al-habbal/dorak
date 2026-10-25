<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\ValuesObjects;

use Modules\BarberAffiliation\Models\BarberAffiliationModel;

final readonly class TerminateAffiliationResult
{
    private function __construct(
        public bool $success,
        public ?BarberAffiliationModel $affiliation,
    ) {}

    public static function success(BarberAffiliationModel $affiliation): self
    {
        return new self(true, $affiliation);
    }

    public static function invalidStatus(): self
    {
        return new self(false, null);
    }
}
