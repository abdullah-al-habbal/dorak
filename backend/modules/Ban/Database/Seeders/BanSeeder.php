<?php

declare(strict_types=1);

namespace Modules\Ban\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Models\BanModel;
use Modules\Client\Models\ClientModel;

class BanSeeder extends Seeder
{
    public function run(): void
    {
        $admin = AdminModel::first() ?? AdminModel::factory()->create();
        $client = ClientModel::first() ?? ClientModel::factory()->create();

        BanModel::create([
            'bannable_id' => $client->id,
            'bannable_type' => BannableTypeEnum::Client,
            'reason' => 'Demo ban — repeated no-shows',
            'banned_at' => now()->subDay(),
            'expires_at' => now()->addDays(7),
            'banned_by_id' => $admin->id,
        ]);
    }
}
