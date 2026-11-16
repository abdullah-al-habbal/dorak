<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\Constants\ServiceCatalogMediaConstants;

/** FT-12: one raster image for a catalog item. SVG is refused (it can carry script) and the pixel size is capped. */
final class UploadCatalogItemMediaRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        $side = ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_SIDE;

        return [
            'file' => [
                'required',
                'file',
                'mimes:'.ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MIMES,
                'max:'.ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_KB,
                "dimensions:max_width={$side},max_height={$side}",
            ],
        ];
    }
}
