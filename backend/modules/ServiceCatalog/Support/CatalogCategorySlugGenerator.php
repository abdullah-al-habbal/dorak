<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Support;

use Illuminate\Support\Str;
use Modules\ServiceCatalog\Constants\ServiceCatalogCategoryConstants;

/**
 * Slugs are unique across soft-deleted rows too, so a random suffix keeps a re-created name
 * from colliding with a deleted category.
 */
final class CatalogCategorySlugGenerator
{
    public function generate(string $englishName): string
    {
        $suffix = Str::lower(Str::random(ServiceCatalogCategoryConstants::SERVICE_CATALOG_CATEGORY_SLUG_SUFFIX_LENGTH));

        return Str::slug($englishName).'-'.$suffix;
    }
}
