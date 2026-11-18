<?php

declare(strict_types=1);

namespace Modules\Barber\Constants;

final class BarberAccountDeletionConstants
{
    /** Stable API error code for a deletion blocked by pending, confirmed, or in-progress bookings. */
    public const string BARBER_ACCOUNT_DELETION_ACTIVE_BOOKINGS_CODE = 'ACCOUNT_HAS_ACTIVE_BOOKINGS';

    /** Stable API error code for a deletion blocked while the barber still works for a brand or branch. */
    public const string BARBER_ACCOUNT_DELETION_ACTIVE_AFFILIATION_CODE = 'ACCOUNT_HAS_ACTIVE_AFFILIATION';
}
