<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Switches an onboarding hero on or off and orders it. The image is replaced through the separate upload route. */
final class UpdateOnboardingConfigRequest extends BaseApiFormRequest
{
    private const int SORT_ORDER_MAX = 100000;

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:'.self::SORT_ORDER_MAX],
        ];
    }
}
