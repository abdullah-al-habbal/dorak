<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\Support\CatalogCategoryNameRules;

/** The service form's inline create: same name rules as the admin catalog (shared, so they cannot drift). */
final class StoreServiceCategoryRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return CatalogCategoryNameRules::rules();
    }
}
