<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Feedback\Models\FeedbackReportModel;

/** @mixin FeedbackReportModel */
final class AdminFeedbackReportResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'status' => $this->status->value,
            'message' => $this->message,
            'contact_email' => $this->contact_email,
            'source' => [
                'app' => $this->app->value,
                'platform' => $this->platform->value,
                'app_version' => $this->app_version,
                'locale' => $this->locale,
                'screen' => $this->screen,
                'workflow' => $this->workflow,
                'user_type' => $this->user_type?->value,
                'user_id' => $this->user_id,
            ],
            'related' => $this->related_type === null ? null : [
                'type' => $this->related_type->value,
                'id' => $this->related_id,
            ],
            'admin_note' => $this->admin_note,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
