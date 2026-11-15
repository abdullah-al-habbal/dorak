<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Modules\Activation\Exceptions\BarberDeactivatedByAdminException;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Activation\Http\Resources\Business\ActivationLogResource;
use Modules\Activation\Policies\BarberSelfActivationPolicy;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ActivateBarberAction extends BaseApiAction
{
    public function __construct(
        private readonly ToggleActivationHandler $handler,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $barber): JsonResponse
    {
        $barberModel = BarberModel::find($barber);

        if (! $barberModel) {
            return $this->notFound();
        }

        $authenticatedBarber = Auth::guard('barber')->user();

        if ($authenticatedBarber->id !== $barber) {
            return $this->forbidden();
        }

        if (! Gate::forUser($authenticatedBarber)->allows(BarberSelfActivationPolicy::ABILITY, $barberModel)) {
            throw new BarberDeactivatedByAdminException;
        }

        $log = $this->handler->handle(
            $request->toActivateCommand($barber),
        );

        return $this->created(
            data: new ActivationLogResource($log),
            message: __('activation::messages.barber_activated'),
        );
    }
}
