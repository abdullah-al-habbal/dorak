<?php

declare(strict_types=1);

namespace Modules\Payment\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Payment\CQRS\Command\SavePaymentGatewayCommand;
use Modules\Payment\Models\PaymentGatewayModel;

final class SavePaymentGatewayHandler
{
    /** Keeps exactly one default: promoting this gateway demotes the others. */
    public function handle(SavePaymentGatewayCommand $command, ?PaymentGatewayModel $gateway = null): PaymentGatewayModel
    {
        return DB::transaction(function () use ($command, $gateway): PaymentGatewayModel {
            $attributes = [
                'code' => $command->code,
                'name' => $command->name,
                'driver' => $command->driver,
                'is_active' => $command->isActive || $command->isDefault,
                'is_default' => $command->isDefault,
                'sort_order' => $command->sortOrder,
            ];
            if ($command->gatewaySettings !== null) {
                $attributes['gateway_settings'] = $command->gatewaySettings;
            }

            $gateway === null ? $gateway = PaymentGatewayModel::create($attributes) : $gateway->update($attributes);

            if ($gateway->is_default) {
                PaymentGatewayModel::query()->whereKeyNot($gateway->getKey())->update(['is_default' => false]);
            }

            return $gateway;
        });
    }
}
