<?php

declare(strict_types=1);

namespace Modules\Chair\Http\Requests\Client;

use Illuminate\Validation\Rules\Enum;
use Modules\Barber\Rules\BarberBelongsToBranch;
use Modules\Chair\CQRS\Command\Client\UpdateChairCommand;
use Modules\Chair\Enums\ChairShape;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateChairRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', new Enum(ChairStatus::class)],
            'barber_id' => ['sometimes', 'nullable', 'string', 'exists:barbers,id', new BarberBelongsToBranch($this->route('chair')?->branch_id)],
            'floor_zone' => ['nullable', 'string', new Enum(FloorZone::class)],
            'ui_metadata' => ['nullable', 'array'],
            'ui_metadata.position_x' => ['nullable', 'numeric'],
            'ui_metadata.position_y' => ['nullable', 'numeric'],
            'ui_metadata.width' => ['nullable', 'numeric'],
            'ui_metadata.height' => ['nullable', 'numeric'],
            'ui_metadata.rotation' => ['nullable', 'numeric'],
            'ui_metadata.shape' => ['nullable', 'string', new Enum(ChairShape::class)],
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
            uiMetadata: $this->validated('ui_metadata'),
        );
    }
}
