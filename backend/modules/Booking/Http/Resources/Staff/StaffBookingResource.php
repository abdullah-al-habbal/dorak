<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Resources\Staff;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Review\Enums\ReviewSubjectTypeEnum;

/**
 * The booking payload for staff views: the client booking payload plus the
 * client with their reputation (Task 40).
 *
 * @mixin BookingModel
 */
final class StaffBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing([
            'client' => fn ($query) => $query->withReputation(),
            'reviews' => fn ($query) => $query->where('subject_type', ReviewSubjectTypeEnum::Client),
        ]);
        // NS-11: the shop's own rating of the client, so the dashboard can show it instead of offering the action again.
        $clientReview = $this->resource->reviews->first();

        return [
            ...BookingResource::make($this->resource)->resolve($request),
            'client' => BookingClientResource::make($this->resource->getRelation('client')),
            'client_review' => $clientReview === null ? null : [
                'rating' => $clientReview->rating,
                'body' => $clientReview->body,
                'created_at' => $clientReview->created_at?->toIso8601String(),
            ],
        ];
    }
}
