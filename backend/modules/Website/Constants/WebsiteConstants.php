<?php

declare(strict_types=1);

namespace Modules\Website\Constants;

final class WebsiteConstants
{
    /** @var list<string> */
    public const array WEBSITE_LOCALES = ['ar', 'en'];

    public const string WEBSITE_DEFAULT_LOCALE = 'ar';

    /** Matches the `{locale}` route segment. */
    public const string WEBSITE_LOCALE_PATTERN = 'ar|en';

    /** The blade pages that have their own layout; every other page renders as plain legal text. */
    public const array WEBSITE_PAGE_VIEWS = [
        'home' => 'website::pages.home',
        'features' => 'website::pages.features',
        'pricing' => 'website::pages.pricing',
    ];

    public const string WEBSITE_LEGAL_VIEW = 'website::pages.legal';

    public const string WEBSITE_SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

    public const string WEBSITE_XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
}
