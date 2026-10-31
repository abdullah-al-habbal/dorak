<?php

declare(strict_types=1);

namespace Tests\Support\Constants;

/** Shared Damascus-centred explore request fixtures. */
final class ExploreTestConstants
{
    public const string EXPLORE_TEST_LOCATION_QUERY = 'latitude=33.5&longitude=36.3';

    public const string EXPLORE_TEST_BRANCHES_PATH = '/api/v1/explore/branches';

    public const string EXPLORE_TEST_RANKING_URL = self::EXPLORE_TEST_BRANCHES_PATH.'?'.self::EXPLORE_TEST_LOCATION_QUERY.'&radius=100&per_page=3';

    public const string EXPLORE_TEST_SEARCH_URL = self::EXPLORE_TEST_BRANCHES_PATH.'?'.self::EXPLORE_TEST_LOCATION_QUERY.'&radius=1000&universe=men';

    public const string EXPLORE_TEST_UNIVERSE_URL = self::EXPLORE_TEST_BRANCHES_PATH.'?'.self::EXPLORE_TEST_LOCATION_QUERY.'&radius=1000';

    public const string EXPLORE_TEST_UNIFIED_URL = '/api/v1/explore/search?'.self::EXPLORE_TEST_LOCATION_QUERY.'&radius=50';
}
