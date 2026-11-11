<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Models\BarberModel;

/**
 * NS-16: the public identity of a barber a branch may invite. The name is all a manager needs to
 * pick the right person; contact details and the account state are not exposed.
 *
 * @mixin BarberModel
 */
final class BarberLookupResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
