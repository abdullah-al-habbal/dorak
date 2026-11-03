<?php

declare(strict_types=1);

namespace Modules\Booking\Policies;

use Modules\Barber\Models\BarberModel;

final class BookingPolicy
{
    /** Only a barber account may open the barber appointment history; the list itself is scoped to that barber. */
    public function viewOwnHistory(BarberModel $actor): bool
    {
        return $actor->exists;
    }
}
