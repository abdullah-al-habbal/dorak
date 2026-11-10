<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Services\PlatformNotifier;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Mail\OwnerBrandApproved;
use Modules\Dashboard\Mail\OwnerBrandReactivated;
use Modules\Dashboard\Mail\OwnerBrandRejected;
use Modules\Dashboard\Mail\OwnerBrandSubmitted;
use Modules\Dashboard\Mail\OwnerBrandSuspended;
use Modules\Dashboard\Repositories\DashboardPreferredLocaleResolver;
use Throwable;

/** The emails an owner gets about the review of their brand, in the owner's language. */
final class OwnerBrandMailer
{
    public function __construct(private readonly DashboardPreferredLocaleResolver $locales, private readonly PlatformNotifier $notifier) {}

    public function submitted(BrandModel $brand): void
    {
        $this->notifier->toAdmins(PlatformEventEnum::BrandSubmitted, (string) $brand->getKey());
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandSubmitted($name, $url));
    }

    public function approved(BrandModel $brand): void
    {
        $this->notifyOwner($brand, PlatformEventEnum::BrandApproved);
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandApproved($name, $url));
    }

    /** Sent by the brand-rejection flow (NS-06); the reason is shown to the owner. */
    public function rejected(BrandModel $brand, string $reason): void
    {
        $this->notifyOwner($brand, PlatformEventEnum::BrandRejected);
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandRejected($name, $reason, $url));
    }

    public function suspended(BrandModel $brand, string $reason): void
    {
        $this->notifyOwner($brand, PlatformEventEnum::BrandSuspended);
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandSuspended($name, $reason, $url));
    }

    public function reactivated(BrandModel $brand): void
    {
        $this->notifyOwner($brand, PlatformEventEnum::BrandReactivated);
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandReactivated($name, $url));
    }

    private function notifyOwner(BrandModel $brand, PlatformEventEnum $event): void
    {
        $ownerId = $brand->getAttribute('owner_id');
        if (is_string($ownerId)) {
            $this->notifier->toAccount(DeviceTokenUserTypeEnum::Client, $ownerId, $event, (string) $brand->getKey());
        }
    }

    /** @param callable(string, string): Mailable $make */
    private function send(BrandModel $brand, callable $make): void
    {
        try {
            $owner = $brand->owner()->first();
            if (! $owner instanceof ClientModel) {
                return;
            }

            $locale = $this->locales->resolve(DashboardActorTypeEnum::Owner, (string) $owner->getKey(), app()->getLocale());
            $name = (string) $brand->getTranslation('name', $locale, true);
            $url = rtrim((string) config('dashboard.dashboard.frontend_url'), '/').'/dashboard/owner';

            Mail::to((string) $owner->getAttribute('email'))->locale($locale)->send($make($name, $url));
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
