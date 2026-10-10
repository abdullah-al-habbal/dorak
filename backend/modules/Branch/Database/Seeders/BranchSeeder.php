<?php

declare(strict_types=1);

namespace Modules\Branch\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branch = BranchModel::query()->firstOrNew(['email' => 'branch@dorak.sy']);
        if (! $branch->exists) {
            $branch->brand_id = BrandModel::factory()->create()->id;
        }

        $branch->fill([
            'name' => [
                'en' => 'Branch',
                'ar' => 'فرع',
            ],
            'password' => Hash::make('password'),
            'status' => BranchStatusEnum::Enabled,
        ]);
        $branch->save();
    }
}
