<?php

declare(strict_types=1);

namespace Modules\Client\Constants;

final class ClientAccountDeletionConstants
{
    /** Stable API error code for a deletion blocked by pending, confirmed, or in-progress bookings. */
    public const string CLIENT_ACCOUNT_DELETION_ACTIVE_BOOKINGS_CODE = 'ACCOUNT_HAS_ACTIVE_BOOKINGS';
}
