<?php

declare(strict_types=1);

namespace Modules\Brand\Constants;

/** D8: how a brand is reviewed, rejected, resubmitted and suspended. */
final class BrandReviewConstants
{
    /** The first submission plus two resubmissions after a rejection. */
    public const int BRAND_MAX_SUBMISSIONS = 3;

    public const int BRAND_REASON_MIN_LENGTH = 3;

    public const int BRAND_REASON_MAX_LENGTH = 500;

    /** Named gate for the platform-admin brand lifecycle actions. */
    public const string BRAND_REVIEW_ABILITY = 'review-brands';

    private function __construct() {}
}
