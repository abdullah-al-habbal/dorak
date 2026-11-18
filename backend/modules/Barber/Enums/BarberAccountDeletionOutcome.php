<?php

declare(strict_types=1);

namespace Modules\Barber\Enums;

enum BarberAccountDeletionOutcome: string
{
    case Deleted = 'deleted';
    case InvalidPassword = 'invalid_password';
    case ActiveBookings = 'active_bookings';
    case ActiveAffiliation = 'active_affiliation';
}
