<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Explore\Constants\ExploreRateLimitConstants;
use Modules\Explore\Constants\PublicProfileConstants;
use Modules\Explore\Http\Actions\Public\GetPublicBranchProfileAction;
use Modules\Explore\Http\Actions\Public\GetPublicBrandProfileAction;
use Modules\Explore\Http\Actions\Public\GetPublicStylistProfileAction;

// Read-only, unauthenticated profile pages for the web (`/brands/{slug}`, `/branches/{slug}`, `/stylists/{slug}`).
Route::prefix('public')->name('public.')->middleware('throttle:'.ExploreRateLimitConstants::EXPLORE_LIMITER)->group(function (): void {
    Route::get('/brands/{slug}', GetPublicBrandProfileAction::class)->where('slug', PublicProfileConstants::EXPLORE_PROFILE_SLUG_PATTERN)->name('brands.show');
    Route::get('/branches/{slug}', GetPublicBranchProfileAction::class)->where('slug', PublicProfileConstants::EXPLORE_PROFILE_SLUG_PATTERN)->name('branches.show');
    Route::get('/stylists/{slug}', GetPublicStylistProfileAction::class)->where('slug', PublicProfileConstants::EXPLORE_PROFILE_SLUG_PATTERN)->name('stylists.show');
});
