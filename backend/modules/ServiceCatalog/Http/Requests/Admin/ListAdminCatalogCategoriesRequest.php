<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\Constants\ServiceCatalogCategoryConstants;
use Modules\ServiceCatalog\CQRS\Query\Admin\ListAdminCatalogCategoriesQuery;
use Modules\ServiceCatalog\Enums\CatalogCategoryStatusFilterEnum;

final class ListAdminCatalogCategoriesRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['nullable', Rule::enum(CatalogCategoryStatusFilterEnum::class)],
            'search' => ['nullable', 'string', 'max:'.ServiceCatalogCategoryConstants::SERVICE_CATALOG_CATEGORY_SEARCH_MAX_LENGTH],
        ];
    }

    public function toQuery(): ListAdminCatalogCategoriesQuery
    {
        return new ListAdminCatalogCategoriesQuery(
            status: $this->enum('status', CatalogCategoryStatusFilterEnum::class),
            search: trim($this->string('search')->toString()),
        );
    }
}
