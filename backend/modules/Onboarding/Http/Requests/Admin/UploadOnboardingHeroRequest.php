<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Onboarding\Constants\OnboardingMediaConstants;

/** FT-13: one raster image to replace an onboarding hero. SVG is refused and the pixel size is capped. */
final class UploadOnboardingHeroRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        $side = OnboardingMediaConstants::ONBOARDING_MEDIA_MAX_SIDE;

        return [
            'file' => [
                'required',
                'file',
                'mimes:'.OnboardingMediaConstants::ONBOARDING_MEDIA_MIMES,
                'max:'.OnboardingMediaConstants::ONBOARDING_MEDIA_MAX_KB,
                "dimensions:max_width={$side},max_height={$side}",
            ],
        ];
    }
}
