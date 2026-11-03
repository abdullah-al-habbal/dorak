<?php

declare(strict_types=1);

namespace Modules\Chair\Http\Requests\Client;

use Illuminate\Validation\Rules\Enum;
use Modules\Barber\Rules\BarberBelongsToBranch;
use Modules\Chair\CQRS\Command\Client\UpdateChairCommand;
use Modules\Chair\Enums\ChairShape;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateChairRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', new Enum(ChairStatus::class)],
            'force' => ['sometimes', 'boolean'],
            'barber_id' => ['sometimes', 'nullable', 'string', 'exists:barbers,id', new BarberBelongsToBranch($this->route('chair')?->branch_id)],
            'floor_zone' => ['nullable', 'string', new Enum(FloorZone::class)],
            'layout_settings' => ['nullable', 'array:position_x,position_y,width,height,rotation,shape'],
            'layout_settings.position_x' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_POSITION],
            'layout_settings.position_y' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_POSITION],
            'layout_settings.width' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_SIZE],
            'layout_settings.height' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_SIZE],
            'layout_settings.rotation' => ['nullable', 'numeric', ValidationLimitConstants::RULE_LAYOUT_ROTATION],
            'layout_settings.shape' => ['nullable', 'string', new Enum(ChairShape::class)],
        ];
    }

    public function toCommand(string $chairId): UpdateChairCommand
    {
        return new UpdateChairCommand(
            chairId: $chairId,
            label: $this->validated('label'),
            status: $this->validated('status'),
            barberId: $this->validated('barber_id'),
            barberIdProvided: $this->exists('barber_id'),
            floorZone: $this->enum('floor_zone', FloorZone::class),
            layoutSettings: $this->validated('layout_settings'),
            force: $this->boolean('force'),
        );
    }
}
