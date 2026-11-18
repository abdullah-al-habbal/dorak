<?php

declare(strict_types=1);

namespace Modules\Marketing\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\Core\Database\Seeders\Traits\BulkSeedable;

final class SectionSeeder extends Seeder
{
    use BulkSeedable;

    public function run(): void
    {
        $pageIds = DB::table('marketing_pages')
            ->whereIn('slug', array_column(config('marketing.seed_pages'), 'slug'))
            ->pluck('id', 'slug');

        $rows = array_map(function (array $section) use ($pageIds): array {
            $section['page_id'] = $pageIds[$section['page_slug']] ?? null;
            unset($section['page_slug']);

            return $section;
        }, array_merge(config('marketing.seed_sections'), config('marketing.seed_legal_sections')));

        $this->bulkInsertOrIgnore('sections', $rows);
    }
}
