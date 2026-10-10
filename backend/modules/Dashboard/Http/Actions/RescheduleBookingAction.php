<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Http\Resources\Client\BookingResource;
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
        $model = $this->showHandler->handle(new ShowBookingQuery($booking, $actor->isPlatformAdmin() ? null : $actor->branchId));
        try {
            return $this->updated(new BookingResource($this->resolver->resolve($model->id, $request->date('time_slot'), $request->date('ends_at'))));
        } catch (ChairHasActiveBookingsException $exception) {
            return $this->error('BOOKING_SLOT_CONFLICT', $exception->getMessage(), 409);
        }
    }
}
