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
            'travel_radius_km' => $barber->travel_radius_km !== null ? (float) $barber->travel_radius_km : null,
            'rating' => [
                'average' => $barber->rating_average !== null ? (float) $barber->rating_average : null,
                'count' => (int) ($barber->rating_count ?? 0),
            ],
            'portfolio' => $barber->portfolioPhotos->map(fn (BarberPortfolioPhotoModel $photo): array => [
                'id' => $photo->id,
                'url' => Storage::disk('public')->url($photo->image_path),
            ])->all(),
            'services' => $barber->services->map(fn (OfferedServiceModel $service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'price_amount_minor' => (int) $service->price_amount_minor,
                'currency_code' => $service->currency_code,
                'duration_minutes' => $service->duration_minutes,
            ])->all(),
        ];
    }
}
