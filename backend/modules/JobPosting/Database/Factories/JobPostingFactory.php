<?php

declare(strict_types=1);

namespace Modules\JobPosting\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Branch\Models\BranchModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;
use Modules\JobPosting\Models\JobPostingModel;

#[UseModel(JobPostingModel::class)]
class JobPostingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'branch_id' => BranchModel::factory(),
            'title' => [
                'en' => fake()->jobTitle(),
                'ar' => fake('ar_SA')->jobTitle(),
            ],
            'description' => [
                'en' => fake()->paragraph(),
                'ar' => fake('ar_SA')->paragraph(),
            ],
            'status' => JobPostingStatusEnum::Open->value,
            'requirements' => [
                'en' => fake()->sentence(),
                'ar' => fake('ar_SA')->sentence(),
            ],
            'location' => fake()->city(),
            'employment_type' => fake()->randomElement(JobPostingTypeEnum::cases()),
        ];
    }
}
