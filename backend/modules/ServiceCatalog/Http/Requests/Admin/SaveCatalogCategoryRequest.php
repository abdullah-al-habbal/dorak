<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\Constants\ServiceCatalogCategoryConstants;
use Modules\ServiceCatalog\CQRS\Command\Admin\SaveCatalogCategoryCommand;
use Modules\ServiceCatalog\Support\CatalogCategoryNameRules;

/**
 * Create (`POST`) and update (`PUT .../{category}`) share these rules; the name uniqueness
 * ignores the category being updated. Slug and parent are never written from the dashboard.
 */
final class SaveCatalogCategoryRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $category = $this->route('category');
        $descriptionMax = 'max:'.ServiceCatalogCategoryConstants::SERVICE_CATALOG_CATEGORY_DESCRIPTION_MAX_LENGTH;

        return [
            ...CatalogCategoryNameRules::rules(is_string($category) ? $category : null),
            'description' => ['nullable', 'array:en,ar'],
            'description.en' => ['nullable', 'string', $descriptionMax],
            'description.ar' => ['nullable', 'string', $descriptionMax],
            'universe' => ['sometimes', Rule::enum(VenueUniverse::class)],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:'.ServiceCatalogCategoryConstants::SERVICE_CATALOG_CATEGORY_SORT_ORDER_MAX],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function toCommand(): SaveCatalogCategoryCommand
    {
        return new SaveCatalogCategoryCommand($this->validated());
    }
}
