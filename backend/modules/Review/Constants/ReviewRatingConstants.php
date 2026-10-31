<?php

declare(strict_types=1);

namespace Modules\Review\Constants;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

final class ReviewRatingConstants
{
    /** @var array<string, class-string<BranchModel|BarberModel>> */
    public const array REVIEW_RATING_RATED_SUBJECTS = [
        'branch' => BranchModel::class,
        'barber' => BarberModel::class,
    ];
}
