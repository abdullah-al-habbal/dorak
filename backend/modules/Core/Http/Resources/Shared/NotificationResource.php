<?php

declare(strict_types=1);

namespace Modules\Core\Http\Resources\Shared;

use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Core\Models\NotificationModel;

/** @mixin NotificationModel */
final class NotificationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'title' => $this->title,
            'body' => $this->body,
            'data' => (object) $this->data,
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
