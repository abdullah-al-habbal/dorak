<?php

declare(strict_types=1);

namespace Modules\Website\Http\Actions\Shared;

use Illuminate\Http\Response;
use Modules\Marketing\Eloquent\Resolvers\Shared\MarketingPageEloquentResolver;
use Modules\Website\Constants\WebsiteConstants;
use Modules\Website\Support\PageSeo;

/** `/sitemap.xml`: every published page once per language, each with its alternates. Drafts never appear. */
final class ShowSitemapAction
{
    public function __construct(
        private readonly MarketingPageEloquentResolver $pages,
    ) {}

    public function __invoke(): Response
    {
        $entries = '';
        foreach ($this->pages->listPublished() as $page) {
            $path = PageSeo::pathForSlug($page->slug);
            $seo = PageSeo::for(WebsiteConstants::WEBSITE_DEFAULT_LOCALE, $path);
            $lastModified = $page->updated_at?->toAtomString();

            foreach ($seo->alternates as $url) {
                $entries .= '<url><loc>'.e($url).'</loc>';
                if ($lastModified !== null) {
                    $entries .= '<lastmod>'.$lastModified.'</lastmod>';
                }
                foreach ($seo->alternates as $hreflang => $alternate) {
                    $entries .= '<xhtml:link rel="alternate" hreflang="'.$hreflang.'" href="'.e($alternate).'"/>';
                }
                $entries .= '<xhtml:link rel="alternate" hreflang="x-default" href="'.e($seo->defaultUrl).'"/></url>';
            }
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'
            .'<urlset xmlns="'.WebsiteConstants::WEBSITE_SITEMAP_NAMESPACE.'" xmlns:xhtml="'.WebsiteConstants::WEBSITE_XHTML_NAMESPACE.'">'
            .$entries.'</urlset>';

        return new Response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
