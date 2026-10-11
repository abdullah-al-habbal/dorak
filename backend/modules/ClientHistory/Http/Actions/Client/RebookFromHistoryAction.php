<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\ClientHistory\Handlers\RebookFromHistoryHandler;
use Modules\ClientHistory\Http\Requests\Client\RebookFromHistoryRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class RebookFromHistoryAction extends BaseApiAction
{
    public function __construct(
        private readonly RebookFromHistoryHandler $handler,
    ) {}

    public function __invoke(RebookFromHistoryRequest $request, string $history): JsonResponse
    {
        try {
            $booking = $this->handler->handle($request->toCommand($history));
        } catch (ChairNotAvailableException) {
            return $this->error(message: __('booking::messages.chair_not_available'), status: 409);
        } catch (DoubleBookingException) {
            return $this->error(message: __('booking::messages.double_booking'), status: 409);
        } catch (InvalidBookingServicesException) {
            return $this->error(message: __('booking::messages.invalid_booking_services'), status: 422);
        } catch (ActiveBookingBanException) {
            return $this->error(message: __('booking::messages.unavailable_for_account'), status: 403);
        } catch (BookingOutsideScheduleException) {
            return $this->error(message: __('booking::messages.time_outside_schedule'), status: 422);
        }

        return $this->created(data: new BookingResource($booking));
    }
}
