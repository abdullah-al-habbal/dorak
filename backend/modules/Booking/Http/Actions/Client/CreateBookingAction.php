<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Handlers\Client\CreateBookingHandler;
use Modules\Booking\Http\Requests\Client\CreateBookingRequest;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class CreateBookingAction extends BaseApiAction
{
    public function __construct(
        private readonly CreateBookingHandler $handler,
    ) {}

    public function __invoke(CreateBookingRequest $request): JsonResponse
    {
        try {
            $result = $this->handler->handle($request->toCommand());
            event(new BookingCreatedEvent($result->booking->id, (string) $result->booking->chair()->value('branch_id')));

            return $this->created(
                data: new BookingResource($result->booking),
                message: __('booking::messages.booking_created'),
            );
        } catch (ChairNotAvailableException) {
            return $this->error(
                message: __('booking::messages.chair_not_available'),
                status: 409,
            );
        } catch (DoubleBookingException) {
            return $this->error(
                message: __('booking::messages.double_booking'),
                status: 409,
            );
        } catch (InvalidBookingServicesException) {
            return $this->error(
                message: __('booking::messages.invalid_booking_services'),
                status: 422,
            );
        } catch (ActiveBookingBanException) {
            return $this->error(message: __('booking::messages.unavailable_for_account'), status: 403);
        } catch (BookingOutsideScheduleException) {
            return $this->error(message: __('booking::messages.time_outside_schedule'), status: 422);
        }
    }
}
