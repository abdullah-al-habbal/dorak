<?php

declare(strict_types=1);

namespace Modules\Admin\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        AdminModel::query()->updateOrCreate(['email' => 'admin@dorak.sy'], [
            'name' => [
                'en' => 'Admin',
                'ar' => 'مدير النظام',
            ],
            'password' => Hash::make('password'),
        ]);
    }
}
