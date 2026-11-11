<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Activation\Http\Resources\Business\ActivationLogResource;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Services\BarberActivationService;
use Modules\Core\Http\Actions\BaseApiAction;

final class ActivateAction extends BaseApiAction
{
    public function __construct(
        private readonly ToggleActivationHandler $handler,
        private readonly BarberActivationService $barbers,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $barber): JsonResponse
    {
        /** @var AdminModel $admin */
        $admin = $request->user('admin_api');
        // A pending or rejected barber stays in the review queue (409); the acting admin is logged.
        $this->barbers->ensureToggleable($barber);

        $log = $this->handler->handle(
            $request->toActivateCommand($barber, activatedById: (string) $admin->getKey()),
        );

        return $this->created(
            data: new ActivationLogResource($log),
            message: __('activation::messages.barber_activated'),
        );
    }
}
