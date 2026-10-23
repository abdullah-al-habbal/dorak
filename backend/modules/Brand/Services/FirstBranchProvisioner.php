<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Illuminate\Support\Str;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

/**
 * A1 (Task 49): every brand is created with exactly one branch. Callers run
 * this inside the transaction that creates the brand (API and admin panel).
 * The branch takes the brand name unless given one; without login
 * credentials it gets a non-routable placeholder email and a random password
 * and stays `pending` until the owner sets them from the dashboard.
 */
final class FirstBranchProvisioner
{
    public function provision(
        BrandModel $brand,
        ?string $nameEn = null,
        ?string $nameAr = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?string $email = null,
        ?string $password = null,
    ): BranchModel {
        return BranchModel::query()->create([
            'brand_id' => $brand->getKey(),
            'name' => [
                'en' => $nameEn ?? $brand->getTranslation('name', 'en', false),
                'ar' => $nameAr ?? $brand->getTranslation('name', 'ar', false),
            ],
            'email' => $email ?? 'branch-'.Str::uuid7().'@branches.dorak.invalid',
            'password' => $password ?? Str::random(48),
            'latitude' => $latitude,
            'longitude' => $longitude,
            'status' => BranchStatusEnum::Pending,
        ]);
    }
}
