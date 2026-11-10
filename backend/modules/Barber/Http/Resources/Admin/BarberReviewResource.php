<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Modules\Ban\Http\Resources\Admin\AdminBanResource;
use Modules\Barber\Constants\BarberReviewConstants;

/** The platform team's view of a barber under review: profile, portfolio and review history. */
final class BarberReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bio' => $this->bio,
            'email' => $this->email,
            'phone' => $this->offsetGet('phone'),
            'has_login' => (bool) $this->offsetGet('has_login'),
            'is_banned' => $this->offsetExists('is_banned') ? (bool) $this->offsetGet('is_banned') : $this->isBanned(),
            'bans' => $this->whenLoaded('bans', fn () => AdminBanResource::collection($this->bans->sortByDesc('banned_at')->values())),
            'is_freelancer' => (bool) $this->is_freelancer,
            'status' => $this->status,
            'email_verified_at' => $this->offsetGet('email_verified_at'),
            'rejection_reason' => $this->offsetGet('rejection_reason'),
            'reviewed_at' => $this->offsetGet('reviewed_at'),
            'submission_count' => (int) $this->offsetGet('submission_count'),
            'max_submissions' => BarberReviewConstants::MAX_SUBMISSIONS,
            'portfolio' => $this->whenLoaded('portfolioPhotos', fn () => $this->portfolioPhotos
                ->map(fn ($photo): array => ['id' => $photo->id, 'url' => Storage::disk('public')->url($photo->image_path)])
                ->values()
                ->all()),
            'created_at' => $this->created_at,
        ];
    }
}
