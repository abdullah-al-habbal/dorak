<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Activation\Http\Resources\Business\ActivationLogResource;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberActivationService;
use Modules\Core\Http\Actions\BaseApiAction;

final class ActivateManagedBarberAction extends BaseApiAction
{
    public function __construct(
        private readonly ToggleActivationHandler $handler,
        private readonly BarberActivationService $barbers,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $barber): JsonResponse
    {
        $barberModel = BarberModel::find($barber);

        if (! $barberModel) {
            return $this->notFound();
        }

        $branch = $request->user('branch_api');
        Gate::forUser($branch)->authorize('manage', $barberModel);

        // A pending or rejected barber stays in the review queue (409).
        $this->barbers->ensureToggleable($barber);

        $log = $this->handler->handle(
            $request->toActivateCommand($barber),
        );

        return $this->created(
            data: new ActivationLogResource($log),
            message: __('activation::messages.barber_activated'),
        );
    }
}
