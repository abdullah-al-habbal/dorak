<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Barber\Rules\BarberBelongsToBranch;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ChairRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['force' => ['sometimes', 'boolean'], 'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')], 'barber_id' => ['sometimes', 'nullable', 'uuid', Rule::exists('barbers', 'id'), new BarberBelongsToBranch($this->input('branch_id'))], 'label' => ['required', 'string', 'max:120'], 'floor_zone' => ['required', Rule::enum(FloorZone::class)], 'status' => ['required', Rule::enum(ChairStatus::class)], 'layout_settings' => ['required', 'array:position_x,position_y,width,height,rotation,shape'], 'layout_settings.position_x' => ['required', 'numeric', ValidationLimitConstants::RULE_LAYOUT_POSITION], 'layout_settings.position_y' => ['required', 'numeric', ValidationLimitConstants::RULE_LAYOUT_POSITION], 'layout_settings.width' => ['required', 'numeric', ValidationLimitConstants::RULE_LAYOUT_SIZE], 'layout_settings.height' => ['required', 'numeric', ValidationLimitConstants::RULE_LAYOUT_SIZE], 'layout_settings.rotation' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_ROTATION]];
    }
}
