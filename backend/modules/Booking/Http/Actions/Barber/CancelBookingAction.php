<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingCancellationTooLateException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingNotAssignedException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Http\Requests\Barber\CancelBarberBookingRequest;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class CancelBookingAction extends BaseApiAction
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    public function __invoke(CancelBarberBookingRequest $request, string $booking): JsonResponse
    {
        $barber = Auth::guard('barber')->user();
        if (! $barber instanceof BarberModel) {
            return $this->unauthorized();
        }
        try {
            $result = $this->lifecycle->cancelForBarber($booking, (string) $barber->id, $request->string('cancellation_reason')->toString());
        } catch (BookingNotAssignedException) {
            return $this->error(message: __('booking::messages.booking_not_assigned'), status: 403);
        } catch (BookingCancellationTooLateException) {
            return $this->unprocessable(message: __('booking::messages.cancel_too_late'));
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.cancel_invalid_status'));
        }

        return $this->ok(new BookingResource($result));
    }
}
