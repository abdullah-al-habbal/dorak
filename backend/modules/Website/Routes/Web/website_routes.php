<?php

// backend/modules/Website/Routes/Web/website_routes.php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Marketing\Constants\MarketingPageConstants;
use Modules\Website\Constants\WebsiteConstants;
use Modules\Website\Http\Actions\Shared\ShowPublicPageAction;
use Modules\Website\Http\Actions\Shared\ShowRobotsAction;
use Modules\Website\Http\Actions\Shared\ShowSitemapAction;
use Modules\Website\Http\Middleware\SetLocaleMiddleware;

Route::get('/robots.txt', ShowRobotsAction::class)->name('website.robots');
Route::get('/sitemap.xml', ShowSitemapAction::class)->name('website.sitemap');

Route::middleware(SetLocaleMiddleware::class)
    ->group(function (): void {
        // Unprefixed pages pick the language from Accept-Language; the `/{locale}` URLs below are the canonical ones.
        Route::get('/', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_HOME_SLUG)->name('website.home');
        Route::get('/features', ShowPublicPageAction::class)->defaults('slug', 'features')->name('website.features');
        Route::get('/pricing', ShowPublicPageAction::class)->defaults('slug', 'pricing')->name('website.pricing');

        Route::prefix('{locale}')->where(['locale' => WebsiteConstants::WEBSITE_LOCALE_PATTERN])->group(function (): void {
            Route::get('/', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_HOME_SLUG)->name('website.localized.home');
            Route::get('/features', ShowPublicPageAction::class)->defaults('slug', 'features')->name('website.localized.features');
            Route::get('/pricing', ShowPublicPageAction::class)->defaults('slug', 'pricing')->name('website.localized.pricing');
            Route::get('/privacy', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_PRIVACY_SLUG)->name('website.localized.privacy');
            Route::get('/terms', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_TERMS_SLUG)->name('website.localized.terms');
            Route::get('/about', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_ABOUT_SLUG)->name('website.localized.about');
            Route::get('/contact', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_CONTACT_SLUG)->name('website.localized.contact');
            Route::get('/delete-account', ShowPublicPageAction::class)->defaults('slug', MarketingPageConstants::MARKETING_PAGE_DELETE_ACCOUNT_SLUG)->name('website.localized.delete-account');
        });
    });
