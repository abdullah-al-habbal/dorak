<?php

declare(strict_types=1);

namespace Modules\Payment\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Payment\Models\PaymentGatewayModel;

/** Pay at salon is a gateway row, not code: admins can add or switch gateways later. */
final class PaymentGatewaySeeder extends Seeder
{
    public function run(): void
    {
        PaymentGatewayModel::query()->firstOrCreate(['code' => 'pay_at_salon'], [
            'name' => ['en' => 'Pay at salon', 'ar' => 'الدفع في الصالون'],
            'driver' => PaymentGatewayModel::DRIVER_OFFLINE,
            'is_active' => true,
            'is_default' => true,
        ]);
    }
}
