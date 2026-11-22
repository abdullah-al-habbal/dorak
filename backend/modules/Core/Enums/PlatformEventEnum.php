<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/**
 * NS-10: the dashboard notification events. The dashboard renders its own localized text from
 * the event key; `title()` and `body()` are the text stored with the row, written in the
 * recipient's language (`Lang/{en,ar}/platform_events.php`) for clients that show it as is.
 */
enum PlatformEventEnum: string
{
    case BrandSubmitted = 'brand_submitted';
    case BarberAwaitingApproval = 'barber_awaiting_approval';
    case ReviewDisputed = 'review_disputed';
    case BrandApproved = 'brand_approved';
    case BrandRejected = 'brand_rejected';
    case BrandSuspended = 'brand_suspended';
    case BrandReactivated = 'brand_reactivated';
    case BarberApproved = 'barber_approved';
    case BarberRejected = 'barber_rejected';

    /** The notification title in `$locale` (the current locale when null). */
    public function title(?string $locale = null): string
    {
        return $this->text('title', $locale);
    }

    /** The notification body in `$locale` (the current locale when null). */
    public function body(?string $locale = null): string
    {
        return $this->text('body', $locale);
    }

    private function text(string $part, ?string $locale): string
    {
        return __("core::platform_events.{$this->value}.{$part}", [], $locale);
    }
}
