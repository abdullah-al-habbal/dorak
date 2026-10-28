<?php

declare(strict_types=1);

namespace Modules\Payment\Handlers;

use Modules\Payment\Models\PaymentGatewayModel;

final class SetPaymentGatewayActiveHandler
{
    /** The default gateway and the last active one cannot be switched off. */
    public function handle(PaymentGatewayModel $gateway, bool $active): bool
    {
        if (! $active && ($gateway->is_default || ! $this->hasOtherActive($gateway))) {
            return false;
        }

        $gateway->update(['is_active' => $active]);

        return true;
    }

    private function hasOtherActive(PaymentGatewayModel $gateway): bool
    {
        return PaymentGatewayModel::query()->whereKeyNot($gateway->getKey())->where('is_active', true)->exists();
    }
}
