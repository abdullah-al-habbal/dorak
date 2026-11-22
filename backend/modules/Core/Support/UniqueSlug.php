<?php

declare(strict_types=1);

namespace Modules\Core\Support;

use Closure;
use Illuminate\Support\Str;
use Modules\Core\Constants\SlugConstants;

/** Builds a URL slug from a name, suffixed `-2`, `-3`… until `$taken` says it is free. */
final class UniqueSlug
{
    /** @param Closure(string): bool $taken */
    public static function make(string $name, string $fallback, Closure $taken): string
    {
        $base = Str::limit(Str::slug($name), SlugConstants::CORE_SLUG_BASE_MAX_LENGTH, '') ?: $fallback;
        $slug = $base;

        for ($suffix = 2; $taken($slug); $suffix++) {
            $slug = "{$base}-{$suffix}";
        }

        return $slug;
    }
}
