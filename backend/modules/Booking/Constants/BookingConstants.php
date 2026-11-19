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

    public const string BOOKING_IDEMPOTENCY_HEADER = 'Idempotency-Key';

    public const string BOOKING_IDEMPOTENCY_REPLAYED_HEADER = 'Idempotency-Replayed';

    public const int BOOKING_IDEMPOTENCY_KEY_MIN_LENGTH = 8;

    public const int BOOKING_IDEMPOTENCY_KEY_MAX_LENGTH = 64;

    /** Letters, digits and `. _ : -`, so a UUID or a prefixed id both fit. */
    public const string BOOKING_IDEMPOTENCY_KEY_PATTERN = '/^[A-Za-z0-9._:-]+$/';

    /** A key older than this is forgotten: the same key may then create a new booking. */
    public const int BOOKING_IDEMPOTENCY_TTL_HOURS = 48;
}
