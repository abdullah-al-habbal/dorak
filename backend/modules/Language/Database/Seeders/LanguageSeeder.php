<?php

declare(strict_types=1);

namespace Modules\Language\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Language\Enums\TextDirectionEnum;
use Modules\Language\Models\LanguageModel;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        LanguageModel::create([
            'code' => 'en',
            'name' => ['en' => 'English', 'ar' => 'الإنجليزية'],
            'text_direction' => TextDirectionEnum::Ltr,
            'is_default' => true,
        ]);

        LanguageModel::create([
            'code' => 'ar',
            'name' => ['en' => 'Arabic', 'ar' => 'العربية'],
            'text_direction' => TextDirectionEnum::Rtl,
            'is_default' => false,
        ]);
    }
}
