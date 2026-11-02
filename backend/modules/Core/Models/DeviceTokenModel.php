<?php

declare(strict_types=1);

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;

/**
 * @property string $id
 * @property string $token
 */
#[Fillable(['user_id', 'user_type', 'token', 'platform_type', 'last_used_at'])]
#[Table('device_tokens')]
final class DeviceTokenModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'user_type' => DeviceTokenUserTypeEnum::class,
            'platform_type' => DevicePlatformEnum::class,
            'last_used_at' => 'datetime',
        ];
    }
}
