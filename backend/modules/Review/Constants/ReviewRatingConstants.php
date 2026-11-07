<?php

declare(strict_types=1);

namespace Modules\Review\Constants;

use Modules\Review\Enums\ReviewSubjectTypeEnum;

final class ReviewRatingConstants
{
    /** @var list<ReviewSubjectTypeEnum> */
    public const array REVIEW_RATING_RATED_SUBJECTS = [
        ReviewSubjectTypeEnum::Branch,
        ReviewSubjectTypeEnum::Barber,
    ];

    public const int REVIEW_RATING_MIN = 1;

    public const int REVIEW_RATING_MAX = 5;
}
