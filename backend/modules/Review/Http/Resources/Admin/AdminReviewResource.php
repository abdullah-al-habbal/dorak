<?php

declare(strict_types=1);

namespace Modules\Review\Http\Resources\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Review\Http\Resources\Shared\ReviewResource;

/** The moderation view of a review: public fields plus the dispute reason and resolution note. */
final class AdminReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $resolvedAt = $this->offsetGet('resolved_at');

        return [
            ...(new ReviewResource($this->resource))->toArray($request),
            'dispute_reason' => $this->offsetGet('dispute_reason'),
            'resolution_note' => $this->offsetGet('resolution_note'),
            'resolved_at' => $resolvedAt instanceof Carbon ? $resolvedAt->toIso8601String() : null,
        ];
    }
}
