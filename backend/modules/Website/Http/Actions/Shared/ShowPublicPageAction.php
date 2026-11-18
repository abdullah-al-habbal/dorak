<?php

declare(strict_types=1);

namespace Modules\Website\Http\Actions\Shared;

use Illuminate\Contracts\View\View;
use Modules\Marketing\Enums\UniverseVisibilityEnum;
use Modules\Marketing\Handlers\Shared\GetMarketingPageHandler;
use Modules\Website\Constants\WebsiteConstants;
use Modules\Website\Support\PageSeo;

/** Renders one published marketing or legal page; a draft or unknown slug is a 404. */
final class ShowPublicPageAction
{
    public function __construct(
        private readonly GetMarketingPageHandler $handler,
    ) {}

    public function __invoke(string $slug): View
    {
        $locale = app()->getLocale();
        $page = $this->handler->handle($slug, $locale, UniverseVisibilityEnum::All);
        abort_if($page === null, 404);

        return view(WebsiteConstants::WEBSITE_PAGE_VIEWS[$slug] ?? WebsiteConstants::WEBSITE_LEGAL_VIEW, [
            'page' => $page,
            'locale' => $locale,
            'seo' => PageSeo::for($locale, PageSeo::pathForSlug($slug)),
        ]);
    }
}
