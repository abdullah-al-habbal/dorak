<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Carbon;
use Modules\Core\Enums\NotificationDeliveryStatusEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\NotificationDeliveryModel;
use Modules\Core\Models\NotificationModel;

final class NotificationWriter
{
    /**
     * Writes the inbox row for one recipient. A dispatch key makes the write
     * idempotent, so a retried queue job reuses the row it already created.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     */
    public function record(
        string $notifiableType,
        string $notifiableId,
        NotificationTypeEnum $type,
        string $title,
        string $body,
        array $data,
        ?string $dispatchKey = null,
    ): NotificationModel {
        $notifiableType = $this->morphAlias($notifiableType);
        $attributes = [
            'notifiable_type' => $notifiableType,
            'notifiable_id' => $notifiableId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ];

        if ($dispatchKey === null) {
            return NotificationModel::query()->create($attributes);
        }

        return NotificationModel::query()->firstOrCreate(
            ['dedupe_key' => "{$dispatchKey}:{$notifiableType}:{$notifiableId}"],
            $attributes,
        );
    }

    /**
     * Maps a model class or alias to the alias the enforced morph map writes,
     * so rows match the authenticated actor's getMorphClass().
     */
    public function morphAlias(string $notifiableType): string
    {
        $alias = array_search($notifiableType, Relation::morphMap(), true);

        return is_string($alias) ? $alias : $notifiableType;
    }

    public function recordDelivery(
        NotificationModel $notification,
        ?string $deviceTokenId,
        NotificationDeliveryStatusEnum $status,
        ?string $providerMessageId = null,
        ?string $error = null,
    ): NotificationDeliveryModel {
        return NotificationDeliveryModel::query()->create([
            'notification_id' => $notification->id,
            'device_token_id' => $deviceTokenId,
            'status' => $status,
            'provider_message_id' => $providerMessageId,
            'error' => $error,
            'attempted_at' => Carbon::now(),
        ]);
    }

    /**
     * @return list<string>
     */
    public function deliveredTokenIds(NotificationModel $notification): array
    {
        return array_values(array_filter(
            $notification->deliveries()
                ->where('status', NotificationDeliveryStatusEnum::Sent)
                ->pluck('device_token_id')
                ->all(),
            is_string(...),
        ));
    }
}
