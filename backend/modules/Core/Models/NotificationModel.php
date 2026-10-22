<?php

declare(strict_types=1);

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;
use Modules\Core\Enums\NotificationTypeEnum;

/**
 * @property string $id
 * @property string $notifiable_type
 * @property string $notifiable_id
 * @property NotificationTypeEnum $type
 * @property string $title
 * @property string $body
 * @property array<string, bool|float|int|string|null> $data
 * @property string|null $dedupe_key
 * @property Carbon|null $read_at
 * @property Carbon $created_at
 */
#[Fillable(['notifiable_type', 'notifiable_id', 'type', 'title', 'body', 'data', 'dedupe_key', 'read_at'])]
#[Table('notifications')]
final class NotificationModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'type' => NotificationTypeEnum::class,
            'data' => 'array',
            'read_at' => 'datetime',
        ];
    }

    /** @return MorphTo<Model, $this> */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /** @return HasMany<NotificationDeliveryModel, $this> */
    public function deliveries(): HasMany
    {
        return $this->hasMany(NotificationDeliveryModel::class, 'notification_id');
    }
}
