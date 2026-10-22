<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\RescheduleBookingEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;
use Modules\Dashboard\Handlers\Bookings\ShowBookingHandler;
use Modules\Dashboard\Http\Requests\RescheduleBookingRequest;
use Modules\Dashboard\Support\DashboardActor;

final class RescheduleBookingAction extends BaseApiAction
{
    public function __construct(private readonly ShowBookingHandler $showHandler, private readonly RescheduleBookingEloquentResolver $resolver) {}

    public function __invoke(RescheduleBookingRequest $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowBookingQuery($booking, $actor->scopedBranchIds()));
        $timeSlot = $request->date('time_slot');
        $endsAt = $request->date('ends_at');
        if ($timeSlot === null || $endsAt === null) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
        try {
            return $this->updated(new StaffBookingResource($this->resolver->resolve((string) $model->id, $timeSlot, $endsAt)));
        } catch (ChairHasActiveBookingsException) {
            return $this->error('BOOKING_SLOT_CONFLICT', __('dashboard::messages.booking_slot_conflict'), 409);
        } catch (BookingOutsideScheduleException) {
            return $this->error('booking_outside_schedule', __('booking::messages.time_outside_schedule'), 422);
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
    }
}
