<?php

declare(strict_types=1);

namespace Modules\Brand\Constants;

use Modules\Brand\Features\JobBoardFeature;
use Modules\Brand\Features\MultiBranchFeature;

final class BrandFeatureConstants
{
    public const string BRAND_FEATURE_MULTI_BRANCH = 'multi_branch';

    public const string BRAND_FEATURE_JOB_BOARD = 'job_board';

    /** @var array<string, class-string> */
    public const array BRAND_FEATURE_CLASS_BY_KEY = [
        self::BRAND_FEATURE_MULTI_BRANCH => MultiBranchFeature::class,
        self::BRAND_FEATURE_JOB_BOARD => JobBoardFeature::class,
    ];
}
