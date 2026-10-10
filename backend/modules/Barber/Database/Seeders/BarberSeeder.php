<?php

declare(strict_types=1);

namespace Modules\Barber\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;

class BarberSeeder extends Seeder
{
    public function run(): void
    {
        BarberModel::query()->updateOrCreate(['email' => 'barber@dorak.sy'], [
            'name' => [
                'en' => 'Barber',
                'ar' => 'حلاق',
            ],
            'password' => Hash::make('password'),
            'has_login' => true,
            'status' => BarberStatusEnum::Enabled,
        ]);
    }
}
