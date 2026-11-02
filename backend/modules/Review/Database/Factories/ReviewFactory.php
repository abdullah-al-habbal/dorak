<?php

// modules/Review/Database/Factories/ReviewFactory.php
declare(strict_types=1);

namespace Modules\Review\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

#[UseModel(ReviewModel::class)]
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_id' => BookingModel::factory()->completed(),
            'author_id' => ClientModel::factory(),
            'author_type' => ReviewAuthorTypeEnum::Client,
            'subject_id' => ClientModel::factory(),
            'subject_type' => ReviewSubjectTypeEnum::Client,
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->sentence(),
            'status' => ReviewStatus::Published,
        ];
    }
}
