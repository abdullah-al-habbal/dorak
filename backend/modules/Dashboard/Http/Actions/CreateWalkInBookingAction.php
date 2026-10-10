<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Bookings\CreateWalkInBookingHandler;
use Modules\Dashboard\Http\Requests\CreateWalkInBookingRequest;
use Modules\Dashboard\Support\DashboardActor;

final class CreateWalkInBookingAction extends BaseApiAction
{
    public function __construct(private readonly CreateWalkInBookingHandler $handler) {}

    public function __invoke(CreateWalkInBookingRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $command = $request->toCommand();

        if (! $actor->isPlatformAdmin() && $actor->branchId !== $command->branchId) {
            return $this->forbidden();
        }

        try {
            return $this->created(new BookingResource($this->handler->handle($command)));
        } catch (ChairNotAvailableException|DoubleBookingException) {
            return $this->error('BOOKING_SLOT_CONFLICT', 'The selected chair or stylist is no longer available for this time.', 409);
        } catch (InvalidBookingServicesException) {
            return $this->unprocessable(message: 'Select active services with a valid duration.');
        }
    }
}
