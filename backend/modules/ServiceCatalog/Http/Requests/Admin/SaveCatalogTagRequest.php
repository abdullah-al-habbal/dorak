<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\Constants\ServiceCatalogTagConstants;

/** Create (`POST`) and update (`PUT .../{tag}`) share these rules. The slug is generated on create and never edited. */
final class SaveCatalogTagRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $name = 'max:'.ServiceCatalogTagConstants::SERVICE_CATALOG_TAG_NAME_MAX_LENGTH;

        return [
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', $name],
            'name.ar' => ['required', 'string', $name],
            'group_name' => ['nullable', 'string', 'max:'.ServiceCatalogTagConstants::SERVICE_CATALOG_TAG_GROUP_MAX_LENGTH],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
