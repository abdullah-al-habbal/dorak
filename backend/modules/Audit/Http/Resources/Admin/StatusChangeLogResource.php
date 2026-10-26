<?php

declare(strict_types=1);

namespace Modules\Audit\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Audit\Models\StatusChangeLogModel;

/**
 * @mixin StatusChangeLogModel
 */
final class StatusChangeLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_type' => $this->subject_type->value,
            'subject_id' => $this->subject_id,
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'actor_type' => $this->actor_type->value,
            'actor_id' => $this->actor_id,
            'reason' => $this->reason,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
