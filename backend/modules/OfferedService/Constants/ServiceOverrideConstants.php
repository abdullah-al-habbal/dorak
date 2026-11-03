<?php

declare(strict_types=1);

namespace Modules\OfferedService\Constants;

final class ServiceOverrideConstants
{
    /** In-memory relation key holding the brand override resolved for a service (null when the brand set none). */
    public const string SERVICE_OVERRIDE_ACTIVE_RELATION = 'activeOverride';

    /** Longest duration, in minutes, a service may last (matches the service form rules). */
    public const int SERVICE_OVERRIDE_MAX_DURATION_MINUTES = 1440;

    /** Price of a booked service after the booking's brand override, else the service's own default (needs BookingServicePricing joins). */
    public const string SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL = 'COALESCE(barber_service_overrides.price_amount_minor, offered_services.price_amount_minor)';
}
