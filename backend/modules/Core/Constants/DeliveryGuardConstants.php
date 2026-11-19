<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class DeliveryGuardConstants
{
    /** Mailers that deliver nothing to a person: they only log or collect messages. */
    public const array DELIVERY_GUARD_UNSAFE_MAILERS = ['log', 'array'];
}
