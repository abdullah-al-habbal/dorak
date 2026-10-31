<?php

declare(strict_types=1);

namespace Modules\Explore\Constants;

final class ExploreSearchConstants
{
    /** Request keys that make a plain map browse a search. */
    public const array EXPLORE_SEARCH_LOG_KEYS = ['q', 'tag_ids', 'catalog_item_ids', 'available_now', 'price_range', 'rating_min', 'face_shape_compatible', 'universe'];

    public const array EXPLORE_SEARCH_TEXT_LOCALES = ['en', 'ar'];
}
