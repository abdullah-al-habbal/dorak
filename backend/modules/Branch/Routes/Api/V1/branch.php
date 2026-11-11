<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Branch\Http\Actions\Branch\AcceptAffiliationAction;
use Modules\Branch\Http\Actions\Branch\CreateJobPostingAction;
use Modules\Branch\Http\Actions\Branch\CreateManagedBarberAction;
use Modules\Branch\Http\Actions\Branch\DashboardAction;
use Modules\Branch\Http\Actions\Branch\DeleteHoursOverrideAction;
use Modules\Branch\Http\Actions\Branch\DeleteJobPostingAction;
use Modules\Branch\Http\Actions\Branch\ForgotPasswordAction;
use Modules\Branch\Http\Actions\Branch\GetProfileAction;
use Modules\Branch\Http\Actions\Branch\InviteAffiliationAction;
use Modules\Branch\Http\Actions\Branch\ListAffiliationsAction;
use Modules\Branch\Http\Actions\Branch\ListApplicationsAction;
use Modules\Branch\Http\Actions\Branch\ListBookingsAction;
use Modules\Branch\Http\Actions\Branch\ListBranchChairsAction;
use Modules\Branch\Http\Actions\Branch\ListJobPostingsAction;
use Modules\Branch\Http\Actions\Branch\ListReviewsAction;
use Modules\Branch\Http\Actions\Branch\LoginAction;
use Modules\Branch\Http\Actions\Branch\LogoutAction;
use Modules\Branch\Http\Actions\Branch\MarkApplicationsSeenAction;
use Modules\Branch\Http\Actions\Branch\RefreshTokenAction;
use Modules\Branch\Http\Actions\Branch\RejectAffiliationAction;
use Modules\Branch\Http\Actions\Branch\ResetPasswordAction;
use Modules\Branch\Http\Actions\Branch\TerminateAffiliationAction;
use Modules\Branch\Http\Actions\Branch\ToggleChairStatusAction;
use Modules\Branch\Http\Actions\Branch\UpdateApplicationStatusAction;
use Modules\Branch\Http\Actions\Branch\UpdateBookingStatusAction;
use Modules\Branch\Http\Actions\Branch\UpdateFloorPlanConfigurationAction;
use Modules\Branch\Http\Actions\Branch\UpdateHoursOverrideAction;
use Modules\Branch\Http\Actions\Branch\UpdateJobPostingAction;
use Modules\Branch\Http\Actions\Branch\UpdateOpeningHoursAction;
use Modules\Branch\Http\Actions\Branch\UpdateProfileAction;
use Modules\Branch\Http\Middleware\EnsureBranchAccountAccess;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;

Route::prefix('branch')->name('branch.')->group(function (): void {
    Route::post('/login', LoginAction::class)->name('login')->middleware('throttle:5,1');
    Route::post('/forgot-password', ForgotPasswordAction::class)->name('forgot-password')->middleware('throttle:5,1');
    Route::post('/reset-password', ResetPasswordAction::class)->name('reset-password')->middleware('throttle:5,1');

    Route::middleware(['auth:branch_api', ApplyPreferredLocaleMiddleware::class.':branch_api'])->group(function (): void {
        Route::post('/logout', LogoutAction::class)->name('logout');
    });

    Route::middleware(['auth:branch_api', EnsureBranchAccountAccess::class, ApplyPreferredLocaleMiddleware::class.':branch_api'])->group(function (): void {
        Route::post('/refresh-token', RefreshTokenAction::class)->name('refresh-token')->middleware('throttle:5,1');
        Route::get('/dashboard', DashboardAction::class)->name('dashboard');
        Route::get('/profile', GetProfileAction::class)->name('profile.get');
        Route::patch('/profile', UpdateProfileAction::class)->name('profile.update');
        Route::put('/opening-hours', UpdateOpeningHoursAction::class)->name('opening-hours.update');
        Route::put('/hours-overrides/{date}', UpdateHoursOverrideAction::class)->name('hours-overrides.update')->where('date', '\d{4}-\d{2}-\d{2}');
        Route::delete('/hours-overrides/{date}', DeleteHoursOverrideAction::class)->name('hours-overrides.delete')->where('date', '\d{4}-\d{2}-\d{2}');
        Route::patch('/floor-plan', UpdateFloorPlanConfigurationAction::class)->name('floor-plan.update');
        Route::patch('/chairs/{chair}/status', ToggleChairStatusAction::class)->name('chairs.status');
        Route::post('/barbers', CreateManagedBarberAction::class)->name('barbers.create');
        Route::get('/affiliations', ListAffiliationsAction::class)->name('affiliations.list');
        Route::post('/affiliations', InviteAffiliationAction::class)->name('affiliations.invite');
        Route::post('/affiliations/{affiliation}/accept', AcceptAffiliationAction::class)->name('affiliations.accept');
        Route::post('/affiliations/{affiliation}/reject', RejectAffiliationAction::class)->name('affiliations.reject');
        Route::post('/affiliations/{affiliation}/terminate', TerminateAffiliationAction::class)->name('affiliations.terminate');
        Route::get('/bookings', ListBookingsAction::class)->name('bookings.list');
        Route::patch('/bookings/{booking}/status', UpdateBookingStatusAction::class)->name('bookings.status');
        Route::get('/chairs', ListBranchChairsAction::class)->name('chairs.list');
        Route::get('/job-postings', ListJobPostingsAction::class)->name('job-postings.list');
        Route::post('/job-postings', CreateJobPostingAction::class)->name('job-postings.create');
        Route::put('/job-postings/{jobPosting}', UpdateJobPostingAction::class)->name('job-postings.update');
        Route::delete('/job-postings/{jobPosting}', DeleteJobPostingAction::class)->name('job-postings.delete');
        Route::get('/job-postings/{jobPosting}/applications', ListApplicationsAction::class)->name('job-postings.applications');
        Route::post('/job-postings/{jobPosting}/applications/mark-seen', MarkApplicationsSeenAction::class)->name('job-postings.applications.mark-seen');
        Route::patch('/job-postings/{jobPosting}/applications/{application}/status', UpdateApplicationStatusAction::class)->name('job-postings.applications.status');
        Route::get('/reviews', ListReviewsAction::class)->name('reviews.list');
    });
});
