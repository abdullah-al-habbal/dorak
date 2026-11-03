<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Barber\Http\Middleware\EnsureBarberAccountAccess;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\Review\Http\Actions\Barber\FlagReviewDisputeAction as BarberFlagReviewDisputeAction;
use Modules\Review\Http\Actions\Barber\ReviewClientAction as BarberReviewClientAction;
use Modules\Review\Http\Actions\Branch\FlagReviewDisputeAction as BranchFlagReviewDisputeAction;
use Modules\Review\Http\Actions\Branch\ReviewClientAction as BranchReviewClientAction;
use Modules\Review\Http\Actions\Client\SubmitReviewAction;
use Modules\Review\Http\Actions\Shared\GetBarberReviewsAction;
use Modules\Review\Http\Actions\Shared\GetBranchReviewsAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
    Route::post('/client/bookings/{booking}/review', SubmitReviewAction::class)->name('reviews.submit');
});

Route::middleware(['auth:branch_api', EnsureBranchAccountAccess::class])->post('/branch/bookings/{booking}/review', BranchReviewClientAction::class)->name('reviews.client.branch');
Route::middleware(['auth:branch_api', EnsureBranchAccountAccess::class])->post('/branch/reviews/{review}/dispute', BranchFlagReviewDisputeAction::class)->name('reviews.dispute.branch');
Route::middleware(['auth:barber', EnsureBarberAccountAccess::class])->post('/barber/bookings/{booking}/review', BarberReviewClientAction::class)->name('reviews.client.barber');
Route::middleware(['auth:barber', EnsureBarberAccountAccess::class])->post('/barber/reviews/{review}/dispute', BarberFlagReviewDisputeAction::class)->name('reviews.dispute.barber');

Route::get('/branches/{branch}/reviews', GetBranchReviewsAction::class)->name('reviews.branch');
Route::get('/barbers/{barber}/reviews', GetBarberReviewsAction::class)->name('reviews.barber');
