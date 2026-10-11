<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Events\WorkstationStatusToggledEvent;
use Modules\Barber\Http\Requests\Barber\UpdateWorkstationStatusRequest;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateWorkstationStatusAction extends BaseApiAction
{
    public function __invoke(UpdateWorkstationStatusRequest $request): JsonResponse
    {
        $barber = Auth::guard('barber')->user();
        if (! $barber instanceof BarberModel) {
            return $this->unauthorized();
        }
        $barber->update(['workstation_online' => $request->boolean('online')]);
        event(new WorkstationStatusToggledEvent($barber->id, (bool) $barber->getAttribute('workstation_online')));

        return $this->ok(data: ['workstation_online' => (bool) $barber->getAttribute('workstation_online')]);
    }
}
