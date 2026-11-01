<?php

declare(strict_types=1);

namespace Modules\Payment\Enums;

/** Integration a payment gateway row runs on; `offline` is pay at salon. */
enum PaymentGatewayDriver: string
{
    case Offline = 'offline';

    public function label(): string
    {
        return $this->value;
    }
}
