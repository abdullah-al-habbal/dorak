<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Support;

use Illuminate\Validation\Rule;
use Modules\ServiceCatalog\Constants\ServiceCatalogCategoryConstants;

/** One bilingual name rule set for every writer of `service_catalog_categories` (admin catalog and inline create). */
final class CatalogCategoryNameRules
{
    private const string TABLE = 'service_catalog_categories';

    /** @return array<string, array<int, mixed>> */
    public static function rules(?string $ignoreId = null): array
    {
        return [
            'name' => ['required', 'array:en,ar'],
            'name.en' => self::localeRules('en', $ignoreId),
            'name.ar' => self::localeRules('ar', $ignoreId),
        ];
    }

    /** @return array<int, mixed> */
    private static function localeRules(string $locale, ?string $ignoreId): array
    {
        $unique = Rule::unique(self::TABLE, 'name->'.$locale)->whereNull('deleted_at');

        return [
            'required',
            'string',
            'max:'.ServiceCatalogCategoryConstants::SERVICE_CATALOG_CATEGORY_NAME_MAX_LENGTH,
            $ignoreId === null ? $unique : $unique->ignore($ignoreId),
        ];
    }
}
