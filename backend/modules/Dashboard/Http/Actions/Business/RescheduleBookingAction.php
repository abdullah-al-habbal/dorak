<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\RescheduleBookingEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;
use Modules\Dashboard\Handlers\Bookings\ShowBookingHandler;
use Modules\Dashboard\Http\Requests\Business\RescheduleBookingRequest;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class RescheduleBookingAction extends BaseApiAction
{
    public function __construct(private readonly ShowBookingHandler $showHandler, private readonly RescheduleBookingEloquentResolver $resolver, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(RescheduleBookingRequest $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowBookingQuery($booking, $actor->scopedBranchIds()));
        Gate::forUser($actor)->authorize('dashboard.booking.manage', $model);
        $this->writeGuard->ensureBookingWritable($actor, $model);
        $startsAt = $request->date('starts_at');
        $endsAt = $request->date('ends_at');
        if ($startsAt === null || $endsAt === null) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
        try {
            return $this->updated(new StaffBookingResource($this->resolver->resolve((string) $model->id, $startsAt, $endsAt)));
        } catch (ChairHasActiveBookingsException) {
            return $this->error('BOOKING_SLOT_CONFLICT', __('dashboard::messages.booking_slot_conflict'), 409);
        } catch (BookingOutsideScheduleException) {
            return $this->error('booking_outside_schedule', __('booking::messages.time_outside_schedule'), 422);
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
    }
}
