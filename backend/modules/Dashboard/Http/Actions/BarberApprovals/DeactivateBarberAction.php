<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Services\BarberActivationService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ToggleBarberActivationRequest;

/** NS-08: the admin switches an approved barber off; the move is logged with the admin and reason. */
final class DeactivateBarberAction extends BaseApiAction
{
    public function __construct(private readonly BarberActivationService $activation) {}

    public function __invoke(ToggleBarberActivationRequest $request, string $barber): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize(BarberReviewConstants::REVIEW_ABILITY);

        return $this->ok(
            data: new BarberReviewResource($this->activation->deactivate($barber, $admin, $request->reason())),
            message: __('barber::messages.activation_toggled'),
        );
    }
}
