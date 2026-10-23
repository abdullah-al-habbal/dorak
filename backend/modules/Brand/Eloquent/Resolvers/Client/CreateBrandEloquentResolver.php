<?php

declare(strict_types=1);

namespace Modules\Brand\Eloquent\Resolvers\Client;

use Illuminate\Support\Facades\DB;
use Modules\Brand\CQRS\Command\Client\CreateBrandCommand;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\FirstBranchProvisioner;

final class CreateBrandEloquentResolver
{
    public function __construct(private readonly FirstBranchProvisioner $firstBranch) {}

    /** A1/A2 (Task 49): the brand and its first branch are created in one transaction. */
    public function resolve(CreateBrandCommand $command): BrandModel
    {
        return DB::transaction(function () use ($command): BrandModel {
            $brand = BrandModel::query()->create([
                'name' => [
                    'en' => $command->nameEn,
                    'ar' => $command->nameAr,
                ],
                'description' => [
                    'en' => $command->descriptionEn ?? '',
                    'ar' => $command->descriptionAr ?? '',
                ],
                'owner_id' => $command->ownerId,
                'base_currency_id' => $command->baseCurrencyId,
                'logo' => $command->logo,
                'universe' => $command->universe,
            ]);

            $this->firstBranch->provision(
                $brand,
                nameEn: $command->firstBranchNameEn ?? $command->nameEn,
                nameAr: $command->firstBranchNameAr ?? $command->nameAr,
                latitude: $command->firstBranchLatitude,
                longitude: $command->firstBranchLongitude,
                email: $command->firstBranchEmail,
                password: $command->firstBranchPassword,
            );

            return $brand->load(['owner', 'baseCurrency'])->loadCount('branches');
        });
    }
}
