<?php

declare(strict_types=1);

namespace Modules\Review\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $booking = BookingModel::where('status', BookingStatus::Completed)->first()
            ?? BookingModel::factory()->completed()->create();

        $client = ClientModel::where('email', 'admin@dorak.sy')->first()
            ?? ClientModel::factory()->create(['email' => 'admin@dorak.sy']);

        ReviewModel::create([
            'booking_id' => $booking->id,
            'author_id' => $client->id,
            'author_type' => ReviewAuthorTypeEnum::Client,
            'subject_id' => $booking->chair->branch_id,
            'subject_type' => ReviewSubjectTypeEnum::Branch,
            'rating' => 5,
            'comment' => 'Great service!',
        ]);
    }
}
