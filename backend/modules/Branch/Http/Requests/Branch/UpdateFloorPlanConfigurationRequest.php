<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rules\Enum;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Branch\Support\FloorPlanLayout;
use Modules\Chair\Enums\FloorZone;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateFloorPlanConfigurationRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'preset' => ['required', new Enum(FloorPlanPreset::class)],
            'zones' => ['nullable', 'array', 'max:8'],
            'zones.*.zone' => ['required_with:zones', new Enum(FloorZone::class)],
            'zones.*.x' => ['required_with:zones', 'numeric', 'between:0,100'],
            'zones.*.y' => ['required_with:zones', 'numeric', 'between:0,100'],
            'zones.*.width' => ['required_with:zones', 'numeric', 'gt:0', 'max:100'],
            'zones.*.height' => ['required_with:zones', 'numeric', 'gt:0', 'max:100'],
            ...FloorPlanLayout::rules(),
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->enum('preset', FloorPlanPreset::class) !== FloorPlanPreset::UnisexZoned) {
            $this->merge(['zones' => []]);
        }
    }
}
