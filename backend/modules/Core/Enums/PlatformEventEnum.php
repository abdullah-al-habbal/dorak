<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/**
 * NS-10: the dashboard notification events. The dashboard renders its own localized text from
 * the event key; `title()` and `body()` are the English fallback stored with the row.
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

    public function title(): string
    {
        return match ($this) {
            self::BrandSubmitted => 'A brand is waiting for approval',
            self::BarberAwaitingApproval => 'A barber is waiting for approval',
            self::ReviewDisputed => 'A review was disputed',
            self::BrandApproved => 'Your brand was approved',
            self::BrandRejected => 'Your brand was not approved',
            self::BrandSuspended => 'Your brand was suspended',
            self::BrandReactivated => 'Your brand was reactivated',
            self::BarberApproved => 'Your account was approved',
            self::BarberRejected => 'Your account was not approved',
        };
    }

    public function body(): string
    {
        return match ($this) {
            self::BrandSubmitted => 'Review the new brand in the approval queue.',
            self::BarberAwaitingApproval => 'Review the new barber in the approval queue.',
            self::ReviewDisputed => 'Decide whether the disputed review stays published.',
            self::BrandApproved => 'You can now add stylists and open your branches to clients.',
            self::BrandRejected => 'Open your business status to see the reason and resubmit.',
            self::BrandSuspended => 'Open your business status to see the reason.',
            self::BrandReactivated => 'Your brand and its enabled branches are visible again.',
            self::BarberApproved => 'You can now sign in to the stylist app.',
            self::BarberRejected => 'Open the stylist app to see the reason and resubmit.',
        };
    }
}
