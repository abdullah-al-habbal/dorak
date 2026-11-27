<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Branch\Services\BranchTimeZones;
use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/** NS-12: one dated exception to the weekly hours, closed all day or a single shortened interval. The date is the route's. */
final class UpdateBranchHoursOverrideRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.app(BranchTimeZones::class)->today((string) $this->route('branch'))],
            ...OpeningHoursRules::day(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['date' => $this->route('date')]);
    }
}
