<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\UpdateBookingStatusRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBookingStatusAction extends BaseApiAction
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $resolver) {}

    public function __invoke(UpdateBookingStatusRequest $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = BookingModel::query()->when($actor->scopedBranchIds() !== null, fn ($query) => $query->forBranches($actor->scopedBranchIds() ?? []))->findOrFail($booking);
        $status = $request->enum('status', BookingStatus::class);
        if (! $status instanceof BookingStatus) {
            return $this->unprocessable(message: __('dashboard::messages.invalid_booking_status'));
        }

        try {
            return $this->updated(new StaffBookingResource($this->resolver->transitionForDashboard($model->id, $status, $actor->actorType, $actor->id)));
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
    }
}
