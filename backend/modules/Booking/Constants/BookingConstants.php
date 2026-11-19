<?php

declare(strict_types=1);

namespace Modules\Booking\Constants;

final class BookingConstants
{
    public const string BOOKING_CANCELLATION_REASON_CHAIR_MAINTENANCE = 'chair_maintenance';

    public const string BOOKING_WRITE_LIMITER = 'booking-write';

    public const string BOOKING_READ_LIMITER = 'booking-read';

    public const string BOOKING_SLOTS_LIMITER = 'booking-slots';

    /** Creating or cancelling a booking, per client. */
    public const int BOOKING_WRITE_PER_MINUTE = 10;

    /** Listing or opening bookings, per client. */
    public const int BOOKING_READ_PER_MINUTE = 60;

    /** Public availability lookups, per IP. */
    public const int BOOKING_SLOTS_PER_MINUTE = 60;
}
