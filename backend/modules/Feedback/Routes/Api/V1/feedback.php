<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Http\Actions\Shared\StoreFeedbackAction;

// Open to guests and every signed-in app: a per-minute and a per-day limit per IP, plus a honeypot field.
Route::post('/feedback', StoreFeedbackAction::class)
    ->middleware(['throttle:'.FeedbackConstants::FEEDBACK_SUBMIT_LIMITER, 'throttle:'.FeedbackConstants::FEEDBACK_DAILY_LIMITER])
    ->name('feedback.store');
