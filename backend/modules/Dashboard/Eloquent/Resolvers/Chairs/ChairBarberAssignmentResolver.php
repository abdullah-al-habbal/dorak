<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Barber\Rules\BarberBelongsToBranch;

final class ChairBarberAssignmentResolver
{
    public function ensureWithinBranch(?string $barberId, ?string $branchId): bool
    {
        $failed = false;
        (new BarberBelongsToBranch($branchId))->validate(
            'barber_id',
            $barberId,
            function () use (&$failed): void {
                $failed = true;
            },
        );

        return ! $failed;
    }
}
