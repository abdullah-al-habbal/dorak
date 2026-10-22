<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Review\Http\Actions\Admin\ResolveReviewDisputeAction;
use Modules\Review\Http\Actions\Client\FlagReviewDisputeAction;
use Modules\Review\Http\Actions\Client\SubmitReviewAction;
use Modules\Review\Http\Actions\Shared\GetBarberReviewsAction;
use Modules\Review\Http\Actions\Shared\GetBranchReviewsAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::post('/client/bookings/{booking}/review', SubmitReviewAction::class)->name('reviews.submit');
    Route::post('/client/reviews/{review}/dispute', FlagReviewDisputeAction::class)->name('reviews.dispute');
});

Route::middleware('auth:admin_api')->group(function (): void {
    Route::patch('/admin/reviews/{review}/resolve', ResolveReviewDisputeAction::class)->name('reviews.resolve');
});

Route::get('/branches/{branch}/reviews', GetBranchReviewsAction::class)->name('reviews.branch');
Route::get('/barbers/{barber}/reviews', GetBarberReviewsAction::class)->name('reviews.barber');
