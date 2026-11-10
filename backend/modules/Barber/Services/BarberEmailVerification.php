<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Mail\BarberEmailVerificationCode;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Services\PlatformNotifier;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class BarberEmailVerification
{
    public function send(BarberModel $barber): bool
    {
        if ($barber->getAttribute('email_verified_at') !== null) {
            return false;
        }

        $code = (string) random_int(100000, 999999);
        $barberId = (string) $barber->getKey();

        if (app()->environment('local')) {
            Log::debug('Development OTP generated', [
                'type' => 'barber_email_verification',
                'barber_id' => $barberId,
                'otp' => $code,
            ]);
        }

        Cache::put($this->codeKey($barberId), Hash::make($code), now()->addMinutes(app(SettingsService::class)->int(SettingKey::BarberEmailVerificationTtlMinutes)));
        Cache::forget($this->attemptsKey($barberId));

        Mail::to((string) $barber->getAttribute('email'))->send(new BarberEmailVerificationCode($code));

        return true;
    }

    public function verify(BarberModel $barber, string $code): bool
    {
        $barberId = (string) $barber->getKey();
        $hash = Cache::get($this->codeKey($barberId));

        if (! is_string($hash) || ! Hash::check($code, $hash)) {
            $this->registerFailedAttempt($barberId);

            return false;
        }

        Cache::forget($this->codeKey($barberId));
        Cache::forget($this->attemptsKey($barberId));

        $barber->forceFill(['email_verified_at' => now()])->save();
        // A verified self-registration reaches the admin queue (NS-30); branch-made barbers never verify here.
        app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::BarberAwaitingApproval, $barberId);

        return true;
    }

    private function registerFailedAttempt(string $barberId): void
    {
        $key = $this->attemptsKey($barberId);

        $attempts = Cache::increment($key, 1);

        if ($attempts === false) {
            Cache::add($key, 1, now()->addMinutes(app(SettingsService::class)->int(SettingKey::BarberEmailVerificationTtlMinutes)));

            $attempts = 1;
        }

        if ($attempts >= app(SettingsService::class)->int(SettingKey::BarberEmailVerificationMaxAttempts)) {
            Cache::forget($this->codeKey($barberId));
            Cache::forget($key);
        }
    }

    private function codeKey(string $barberId): string
    {
        return "barber_email_verify_{$barberId}";
    }

    private function attemptsKey(string $barberId): string
    {
        return "barber_email_verify_attempts_{$barberId}";
    }
}
