<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingNotAssignedException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;

abstract class TransitionBookingAction extends BaseApiAction
{
    abstract protected function targetStatus(): BookingStatus;

    public function __construct(
        private readonly BookingLifecycleEloquentResolver $resolver,
    ) {}

    public function __invoke(string $booking): JsonResponse
    {
        $barber = Auth::guard('barber')->user();

        if (! $barber instanceof BarberModel) {
            return $this->unauthorized();
        }

        try {
            $updated = $this->resolver->transitionForBarber($booking, $barber->id, $this->targetStatus());

            return $this->ok(data: new StaffBookingResource($updated));
        } catch (BookingNotAssignedException) {
            return $this->error(message: __('booking::messages.booking_not_assigned'), status: 403);
        } catch (InvalidBookingTransitionException) {
            return $this->error(message: __('booking::messages.invalid_booking_transition'), status: 422);
        } catch (DoubleBookingException) {
            return $this->error(message: __('booking::messages.double_booking'), status: 409);
        }
    }
}
