<?php

declare(strict_types=1);

namespace Modules\Payment\Handlers;

use Modules\Payment\Models\PaymentGatewayModel;

final class DeletePaymentGatewayHandler
{
    /** The default gateway is protected; returns whether the row was deleted. */
    public function handle(PaymentGatewayModel $gateway): bool
    {
        if ($gateway->is_default) {
            return false;
        }

        $gateway->delete();

        return true;
    }
}
