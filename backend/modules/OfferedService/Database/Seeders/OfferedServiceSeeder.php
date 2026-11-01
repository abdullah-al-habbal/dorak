<?php

declare(strict_types=1);

namespace Modules\OfferedService\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Brand\Models\BrandModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

class OfferedServiceSeeder extends Seeder
{
    public function run(): void
    {
        $syp = CurrencyModel::where('code', 'SYP')->first()
            ?? CurrencyModel::factory()->create(['code' => 'SYP']);

        $brand = BrandModel::first()
            ?? BrandModel::factory()->create();

        OfferedServiceModel::create([
            'serviceable_id' => $brand->id,
            'serviceable_type' => ServiceableTypeEnum::Brand,
            'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
            'description' => ['en' => 'Classic haircut', 'ar' => 'قص شعر كلاسيكي'],
            'price_amount_minor' => 2500000,
            'currency_code' => $syp->code,
            'duration' => 30,
            'is_at_home' => false,
            'is_active' => true,
        ]);

        OfferedServiceModel::create([
            'serviceable_id' => $brand->id,
            'serviceable_type' => ServiceableTypeEnum::Brand,
            'name' => ['en' => 'Beard Trim', 'ar' => 'تهذيب لحية'],
            'description' => ['en' => 'Beard shaping and trim', 'ar' => 'تشذيب وتشكيل اللحية'],
            'price_amount_minor' => 1500000,
            'currency_code' => $syp->code,
            'duration' => 20,
            'is_at_home' => false,
            'is_active' => true,
        ]);
    }
}
