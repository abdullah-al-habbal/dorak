<?php

declare(strict_types=1);

namespace Modules\Review\Http\Resources\Shared;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Review\Enums\ReviewStatus;

final class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        $status = $this->offsetGet('status');
        $disputedAt = $this->offsetGet('disputed_at');
        $resolvedAt = $this->offsetGet('resolved_at');

        return [
            'id' => $this->id,
            'subject_type' => is_string($subjectType = $this->offsetGet('subject_type')) ? Relation::getMorphAlias($subjectType) : null,
            'subject_id' => $this->offsetGet('subject_id'),
            'rating' => $this->rating,
            'comment' => $this->comment,
            'status' => $status instanceof ReviewStatus ? $status->value : null,
            'disputed_at' => $disputedAt instanceof Carbon ? $disputedAt->toIso8601String() : null,
            'resolved_at' => $resolvedAt instanceof Carbon ? $resolvedAt->toIso8601String() : null,
            'author_name' => $this->whenLoaded('author', fn () => $this->author->name),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
