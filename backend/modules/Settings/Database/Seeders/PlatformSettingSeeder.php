<?php

declare(strict_types=1);

namespace Modules\Settings\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Models\PlatformSettingModel;

/** Materialises every default so admins see (and can edit) the full list. */
final class PlatformSettingSeeder extends Seeder
{
    public function run(): void
    {
        foreach (SettingKey::cases() as $key) {
            PlatformSettingModel::query()->firstOrCreate(['setting_key' => $key->value], ['value_integer' => $key->default()]);
        }
    }
}
