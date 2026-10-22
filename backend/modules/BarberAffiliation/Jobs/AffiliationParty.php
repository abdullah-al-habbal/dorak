<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Jobs;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

/**
 * Classifies the polymorphic initiator of an affiliation, which may be stored
 * as a class name or as a morph alias.
 */
final class AffiliationParty
{
    public static function isBarber(mixed $type): bool
    {
        return $type === BarberModel::class || $type === 'barber';
    }

    public static function isBranch(mixed $type): bool
    {
        return $type === BranchModel::class || $type === 'branch';
    }
}
