<?php

declare(strict_types=1);

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Modules\Core\Enums\NotificationDeliveryStatusEnum;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/**
 * @property string $id
 * @property string $notification_id
 * @property string|null $device_token_id
 * @property NotificationDeliveryStatusEnum $status
 * @property string|null $provider_message_id
 * @property string|null $error
 * @property Carbon $attempted_at
 */
#[Fillable(['notification_id', 'device_token_id', 'status', 'provider_message_id', 'error', 'attempted_at'])]
#[Table('notification_deliveries')]
final class NotificationDeliveryModel extends Model
{
    use HasUuids;
    use MassPrunable;

    protected function casts(): array
    {
        return [
            'status' => NotificationDeliveryStatusEnum::class,
            'attempted_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<NotificationModel, $this> */
    public function notification(): BelongsTo
    {
        return $this->belongsTo(NotificationModel::class, 'notification_id');
    }

    /** @return Builder<self> */
    public function prunable(): Builder
    {
        return self::query()->where('attempted_at', '<', Carbon::now()->subDays(app(SettingsService::class)->int(SettingKey::NotificationRetentionDays)));
    }
}
