<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SetCatalogCategoryActiveRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
