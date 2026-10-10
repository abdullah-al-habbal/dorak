<?php

declare(strict_types=1);

namespace Modules\Booking\Enums;

enum BookingPaymentStatus: string
{
    case UnpaidInPerson = 'unpaid_in_person';
}
