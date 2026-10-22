<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Client\Http\Actions\Client\ChangePasswordAction;
use Modules\Client\Http\Actions\Client\DeleteAccountAction;
use Modules\Client\Http\Actions\Client\ForgotPasswordAction;
use Modules\Client\Http\Actions\Client\GetProfileAction;
use Modules\Client\Http\Actions\Client\LoginAction;
use Modules\Client\Http\Actions\Client\LogoutAction;
use Modules\Client\Http\Actions\Client\RefreshTokenAction;
use Modules\Client\Http\Actions\Client\RegisterAction;
use Modules\Client\Http\Actions\Client\ResetPasswordAction;
use Modules\Client\Http\Actions\Client\SendEmailVerificationAction;
use Modules\Client\Http\Actions\Client\SocialLoginAction;
use Modules\Client\Http\Actions\Client\UpdateProfileAction;
use Modules\Client\Http\Actions\Client\UpdateUniversePreferenceAction;
use Modules\Client\Http\Actions\Client\UploadAvatarAction;
use Modules\Client\Http\Actions\Client\VerifyEmailAction;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;

Route::prefix('client')->name('client.')->group(function (): void {
    Route::post('/login', LoginAction::class)->name('login')->middleware('throttle:5,1');
    Route::post('/register', RegisterAction::class)->name('register')->middleware('throttle:5,1');
    Route::post('/social/{provider}', SocialLoginAction::class)->name('social.login')->middleware('throttle:5,1');
    Route::post('/forgot-password', ForgotPasswordAction::class)->name('forgot-password')->middleware('throttle:5,1');
    Route::post('/reset-password', ResetPasswordAction::class)->name('reset-password')->middleware('throttle:5,1');

    Route::middleware(['auth:client', EnsureClientAccountAccess::class.':verification'])->group(function (): void {
        Route::post('/logout', LogoutAction::class)->name('logout');
        Route::post('/refresh-token', RefreshTokenAction::class)->name('refresh-token')->middleware('throttle:5,1');
        Route::get('/profile', GetProfileAction::class)->name('profile.show');
        Route::post('/email/verify', VerifyEmailAction::class)->name('email.verify');
        Route::post('/email/verify/send', SendEmailVerificationAction::class)->name('email.verify.send')->middleware('throttle:3,1');
    });

    Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function (): void {
        Route::patch('/preferences/universe', UpdateUniversePreferenceAction::class)->name('preferences.universe');
        Route::patch('/profile', UpdateProfileAction::class)->name('profile.update');
        Route::post('/avatar', UploadAvatarAction::class)->name('avatar.upload');
        Route::delete('/account', DeleteAccountAction::class)->name('account.delete');
        Route::patch('/password', ChangePasswordAction::class)->name('password.change');
    });
});
