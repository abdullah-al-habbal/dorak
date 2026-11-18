<?php

declare(strict_types=1);

namespace Modules\Website\Http\Actions\Shared;

use Illuminate\Http\Response;

/** `/robots.txt`: crawl the public site, never the API, and point to the sitemap on the configured domain. */
final class ShowRobotsAction
{
    public function __invoke(): Response
    {
        $base = rtrim((string) config('app.url'), '/');

        return new Response(
            "User-agent: *\nDisallow: /api/\n\nSitemap: {$base}/sitemap.xml\n",
            200,
            ['Content-Type' => 'text/plain; charset=UTF-8'],
        );
    }
}
