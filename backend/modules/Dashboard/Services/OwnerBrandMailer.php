<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Mail\OwnerBrandApproved;
use Modules\Dashboard\Mail\OwnerBrandRejected;
use Modules\Dashboard\Mail\OwnerBrandSubmitted;
use Modules\Dashboard\Repositories\DashboardPreferredLocaleResolver;
use Throwable;

/** The three emails an owner gets about the review of their brand, in the owner's language. */
final class OwnerBrandMailer
{
    public function __construct(private readonly DashboardPreferredLocaleResolver $locales) {}

    public function submitted(BrandModel $brand): void
    {
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandSubmitted($name, $url));
    }

    public function approved(BrandModel $brand): void
    {
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandApproved($name, $url));
    }

    /** Sent by the brand-rejection flow (NS-06); the reason is shown to the owner. */
    public function rejected(BrandModel $brand, string $reason): void
    {
        $this->send($brand, fn (string $name, string $url): Mailable => new OwnerBrandRejected($name, $reason, $url));
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
