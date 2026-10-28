<?php

declare(strict_types=1);

namespace Modules\Payment\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

/**
 * An admin-managed payment gateway. `driver` names the integration (offline
 * for pay at salon); `config` holds its credentials, encrypted at rest (Task 65).
 *
 * @property string $id
 * @property string $code
 * @property string $driver
 * @property bool $is_active
 * @property bool $is_default
 * @property array<string, mixed>|null $config
 */
#[Fillable(['code', 'name', 'driver', 'is_active', 'is_default', 'config', 'sort_order'])]
#[Hidden(['config'])]
#[Table('payment_gateways')]
#[Translatable(['name'])]
class PaymentGatewayModel extends Model
{
    use HasFactory, HasTranslations, HasUuids;

    public const string DRIVER_OFFLINE = 'offline';

    protected function casts(): array
    {
        return [
            'config' => 'encrypted:array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
