<?php

declare(strict_types=1);

namespace Modules\Website\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Vite;
use Modules\Website\Constants\WebsiteConstants;

final class SetLocaleMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        // A `/{locale}` URL fixes the language; the parameter is then dropped so actions only see their own arguments.
        $fromUrl = $request->route('locale');
        $locale = is_string($fromUrl) && in_array($fromUrl, WebsiteConstants::WEBSITE_LOCALES, true)
            ? $fromUrl
            : ($request->getPreferredLanguage(WebsiteConstants::WEBSITE_LOCALES) ?? WebsiteConstants::WEBSITE_DEFAULT_LOCALE);
        $request->route()?->forgetParameter('locale');

        App::setLocale($locale);

        Vite::prefetch(concurrency: 3);

        $request->attributes->set('locale', $locale);
        $request->attributes->set('available_locales', WebsiteConstants::WEBSITE_LOCALES);

        return $next($request);
    }
}
