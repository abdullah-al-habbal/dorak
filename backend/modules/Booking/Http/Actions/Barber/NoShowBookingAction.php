<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Barber;

use Modules\Booking\Enums\BookingStatus;

final class NoShowBookingAction extends TransitionBookingAction
{
    protected function targetStatus(): BookingStatus
    {
        return BookingStatus::NoShow;
    }
}
