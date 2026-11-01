<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Handlers\Bookings\ShowBookingHandler;
use Modules\Dashboard\Support\DashboardActor;

final class CancelBookingAction extends BaseApiAction
{
    public function __construct(private readonly ShowBookingHandler $showHandler, private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    public function __invoke(Request $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowBookingQuery($booking, $actor->scopedBranchIds()));
        try {
            return $this->updated(new StaffBookingResource($this->lifecycle->transitionForDashboard($model->id, BookingStatus::Canceled, StatusChangeActorTypeEnum::from($actor->actorType->value), $actor->id)));
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
    }
}
