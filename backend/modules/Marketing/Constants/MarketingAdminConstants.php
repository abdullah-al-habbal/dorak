<?php

declare(strict_types=1);

namespace Modules\Marketing\Constants;

final class MarketingAdminConstants
{
    public const int TEXT_MAX_LENGTH = 255;

    public const int META_MAX_LENGTH = 500;

    public const int TESTIMONIAL_BODY_MAX_LENGTH = 1000;

    public const int AUTHOR_NAME_MAX_LENGTH = 120;

    public const int SORT_ORDER_MAX = 100000;

    public const int RATING_MIN = 1;

    public const int RATING_MAX = 5;

    /** The encoded size of a section body; a body is structured content (headings, feature lists), not a document. */
    public const int SECTION_BODY_MAX_BYTES = 20000;
}
