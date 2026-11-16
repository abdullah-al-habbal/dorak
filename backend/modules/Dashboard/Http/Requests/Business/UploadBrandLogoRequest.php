<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;

/** FT-9: one raster logo image. SVG is refused (it can carry script) and the pixel size is capped. */
final class UploadBrandLogoRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        $side = DashboardBrandConstants::DASHBOARD_BRAND_LOGO_MAX_SIDE;

        return [
            'file' => [
                'required',
                'file',
                'mimes:'.DashboardBrandConstants::DASHBOARD_BRAND_LOGO_MIMES,
                'max:'.DashboardBrandConstants::DASHBOARD_BRAND_LOGO_MAX_KB,
                "dimensions:max_width={$side},max_height={$side}",
            ],
        ];
    }
}
