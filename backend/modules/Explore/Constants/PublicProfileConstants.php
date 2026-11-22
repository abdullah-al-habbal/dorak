<?php

declare(strict_types=1);

namespace Modules\Explore\Constants;

final class PublicProfileConstants
{
    /** Route constraint of a public profile slug: what `Str::slug` produces. */
    public const string EXPLORE_PROFILE_SLUG_PATTERN = '[a-z0-9]+(?:-[a-z0-9]+)*';
}
