<?php

declare(strict_types=1);

namespace Modules\JobPosting\Support;

use Illuminate\Support\Facades\Storage;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberPortfolioPhotoModel;
use Modules\OfferedService\Models\OfferedServiceModel;

/**
 * An immutable copy of a barber's profile taken at application time (G3):
 * editing the profile afterward never changes a stored snapshot.
 */
final class BarberProfileSnapshotBuilder
{
    /** @return array<string, mixed> */
    public function build(BarberModel $barber): array
    {
        return [
            'name' => $barber->name,
            'email' => $barber->email,
            'bio' => $barber->bio,
            'is_freelancer' => (bool) $barber->is_freelancer,
            'travel_radius' => $barber->travel_radius !== null ? (float) $barber->travel_radius : null,
            'rating' => [
                'average' => $barber->rating_avg !== null ? (float) $barber->rating_avg : null,
                'count' => (int) ($barber->rating_count ?? 0),
            ],
            'portfolio' => $barber->portfolioPhotos->map(fn (BarberPortfolioPhotoModel $photo): array => [
                'id' => $photo->id,
                'url' => Storage::disk('public')->url($photo->path),
            ])->all(),
            'services' => $barber->services->map(fn (OfferedServiceModel $service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'price' => (float) $service->price,
                'currency_code' => $service->currency_code,
                'duration' => $service->duration,
            ])->all(),
        ];
    }
}
