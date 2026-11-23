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
        $group = 'max:'.ServiceCatalogTagConstants::SERVICE_CATALOG_TAG_GROUP_MAX_LENGTH;

        return [
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', $name],
            'name.ar' => ['required', 'string', $name],
            'group_name' => ['nullable', 'array:en,ar'],
            'group_name.en' => ['required_with:group_name', 'string', $group],
            'group_name.ar' => ['required_with:group_name', 'string', $group],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
