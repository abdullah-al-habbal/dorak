<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

function nearbyFreelancer(): BarberModel
{
    return BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3]);
}

it('ignores disputed and hidden reviews when filtering by rating_min', function (): void {
    $heldUp = nearbyFreelancer();
    ReviewModel::factory()->create(['subject_type' => 'barber', 'subject_id' => $heldUp->id, 'rating' => 2]);
    ReviewModel::factory()->create(['subject_type' => 'barber', 'subject_id' => $heldUp->id, 'rating' => 5, 'status' => ReviewStatus::Disputed]);
    ReviewModel::factory()->create(['subject_type' => 'barber', 'subject_id' => $heldUp->id, 'rating' => 5, 'status' => ReviewStatus::Hidden]);

    $wellRated = nearbyFreelancer();
    ReviewModel::factory()->create(['subject_type' => 'barber', 'subject_id' => $wellRated->id, 'rating' => 4]);

    $ids = $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000&rating_min=3')
        ->assertOk()
        ->json('data.*.id');

    expect($ids)->toContain($wellRated->id)->not->toContain($heldUp->id);
});
