<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateHoursOverrideRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            ...OpeningHoursRules::day(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['date' => $this->route('date')]);
    }
}
