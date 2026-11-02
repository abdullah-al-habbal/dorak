<?php

declare(strict_types=1);

namespace Modules\Payment\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Payment\Enums\PaymentGatewayDriver;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

/**
 * An admin-managed payment gateway. `driver` names the integration (offline
 * for pay at salon); `gateway_settings` holds its credentials, encrypted at rest (Task 65).
 *
 * @property string $id
 * @property string $code
 * @property PaymentGatewayDriver $driver
 * @property bool $is_active
 * @property bool $is_default
 * @property array<string, mixed>|null $gateway_settings
 */
#[Fillable(['code', 'name', 'driver', 'is_active', 'is_default', 'gateway_settings', 'sort_order'])]
#[Hidden(['gateway_settings'])]
#[Table('payment_gateways')]
#[Translatable(['name'])]
class PaymentGatewayModel extends Model
{
    use HasFactory, HasTranslations, HasUuids;

    protected function casts(): array
    {
        return [
            'driver' => PaymentGatewayDriver::class,
            'gateway_settings' => 'encrypted:array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
