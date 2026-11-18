<?php

declare(strict_types=1);

namespace Modules\Website\Support;

use Modules\Website\Constants\WebsiteConstants;

/**
 * The canonical URL and the per-language alternates of one public page. URLs are built from `APP_URL`, never from the
 * request host, so a forged Host header cannot change what search engines are told.
 */
final readonly class PageSeo
{
    /** @param array<string, string> $alternates locale => absolute URL */
    public function __construct(
        public string $canonical,
        public array $alternates,
        public string $defaultUrl,
    ) {}

    public static function for(string $locale, string $path): self
    {
        $alternates = [];
        foreach (WebsiteConstants::WEBSITE_LOCALES as $candidate) {
            $alternates[$candidate] = self::url($candidate, $path);
        }

        return new self(
            canonical: self::url($locale, $path),
            alternates: $alternates,
            defaultUrl: self::url(WebsiteConstants::WEBSITE_DEFAULT_LOCALE, $path),
        );
    }

    public static function url(string $locale, string $path): string
    {
        $base = rtrim((string) config('app.url'), '/');

        return $path === '' ? "{$base}/{$locale}" : "{$base}/{$locale}/{$path}";
    }

    /** The page path under `/{locale}`: the home page is the empty path. */
    public static function pathForSlug(string $slug): string
    {
        return $slug === 'home' ? '' : $slug;
    }
}
