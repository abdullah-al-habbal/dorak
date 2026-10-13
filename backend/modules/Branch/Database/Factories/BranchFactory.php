<?php

declare(strict_types=1);

namespace Modules\Branch\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

#[UseModel(BranchModel::class)]
class BranchFactory extends Factory
{
    public function definition(): array
    {
        return [
            'brand_id' => BrandModel::factory(),
            'name' => [
                'en' => fake()->name(),
                'ar' => fake('ar_SA')->name(),
            ],
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => BranchStatusEnum::Enabled->value,
        ];
    }
}
