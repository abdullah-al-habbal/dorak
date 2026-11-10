<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Modules\Barber\Mail\BarberApproved;
use Modules\Barber\Mail\BarberRejected;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Services\PlatformNotifier;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardPreferredLocaleResolver;
use Throwable;

/** The two emails a barber gets about the review of their account, in the barber's language. */
final class BarberReviewMailer
{
    public function __construct(private readonly DashboardPreferredLocaleResolver $locales, private readonly PlatformNotifier $notifier) {}

    public function approved(BarberModel $barber): void
    {
        $this->notifier->toAccount(DeviceTokenUserTypeEnum::Barber, (string) $barber->getKey(), PlatformEventEnum::BarberApproved, (string) $barber->getKey());
        $this->send($barber, fn (string $name): BarberApproved => new BarberApproved($name));
    }

    public function rejected(BarberModel $barber, string $reason): void
    {
        $this->notifier->toAccount(DeviceTokenUserTypeEnum::Barber, (string) $barber->getKey(), PlatformEventEnum::BarberRejected, (string) $barber->getKey());
        $this->send($barber, fn (string $name): BarberRejected => new BarberRejected($name, $reason));
    }

    /** @param callable(string): Mailable $make */
    private function send(BarberModel $barber, callable $make): void
    {
        $email = $barber->getAttribute('email');
        if (! is_string($email) || $email === '') {
            return;
        }

        try {
            $locale = $this->locales->resolve(DashboardActorTypeEnum::Barber, (string) $barber->getKey(), app()->getLocale());
            $name = (string) $barber->getTranslation('name', $locale, true);

            Mail::to($email)->locale($locale)->send($make($name));
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
