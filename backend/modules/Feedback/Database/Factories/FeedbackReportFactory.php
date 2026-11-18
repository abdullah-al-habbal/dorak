<?php

declare(strict_types=1);

namespace Modules\Feedback\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Feedback\Enums\FeedbackAppEnum;
use Modules\Feedback\Enums\FeedbackKindEnum;
use Modules\Feedback\Enums\FeedbackStatusEnum;
use Modules\Feedback\Models\FeedbackReportModel;

#[UseModel(FeedbackReportModel::class)]
final class FeedbackReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kind' => FeedbackKindEnum::Bug,
            'status' => FeedbackStatusEnum::New,
            'message' => fake()->sentence(8),
            'contact_email' => fake()->safeEmail(),
            'app' => FeedbackAppEnum::Client,
            'platform' => DevicePlatformEnum::Android,
            'app_version' => '1.0.0+1',
            'locale' => 'en',
            'screen' => 'booking/confirm',
        ];
    }
}
