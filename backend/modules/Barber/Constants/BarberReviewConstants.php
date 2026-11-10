<?php

declare(strict_types=1);

namespace Modules\Barber\Constants;

/** D8: how a self-registered barber is reviewed before going live. */
final class BarberReviewConstants
{
    /** The first submission plus two resubmissions after a rejection. */
    public const int MAX_SUBMISSIONS = 3;

    public const string REVIEW_ABILITY = 'review-barbers';

    public const int REASON_MAX_LENGTH = 500;

    public const int REASON_MIN_LENGTH = 3;
}
