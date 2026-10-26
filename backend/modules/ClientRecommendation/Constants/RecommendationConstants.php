<?php

// modules/ClientRecommendation/Constants/RecommendationConstants.php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Constants;

final class RecommendationConstants
{
    private function __construct() {}

    public const DEFAULT_WEIGHTS = [
        'alpha' => 0.4,
        'beta' => 0.3,
        'gamma' => 0.1,
        'geographic' => 0.2,
    ];

    public const FACTOR_WEIGHTS_V2 = [
        'alpha' => 0.40,
        'beta' => 0.35,
        'gamma' => 0.15,
        'geographic' => 0.10,
    ];

    public const EXPLORE_RANKING_VARIANT_DEFAULT = 'default';

    public const EXPLORE_RANKING_VARIANT_FACTOR_WEIGHTS_V2 = 'factor-weights-v2';

    public const VECTOR_VERSION = 'v1';
}
