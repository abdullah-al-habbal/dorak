<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Branch\Http\Requests\Branch\UpdateBookingStatusRequest;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateBookingStatusAction extends BaseApiAction
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    public function __invoke(UpdateBookingStatusRequest $request, string $booking): JsonResponse
    {
        $branch = $request->user('branch_api');
        if (! $branch instanceof BranchModel) {
            return $this->unauthorized();
        }
        Gate::forUser($branch)->authorize('manage', $branch);
        $value = $request->input('booking_status');
        if (! is_string($value)) {
            return $this->unprocessable(message: __('branch::messages.invalid_booking_status'));
        }
        $status = BookingStatus::from($value);
        try {
            return $this->ok(data: StaffBookingResource::make($this->lifecycle->transitionForBranch($booking, $branch->id, $status)));
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_transition'));
        }
    }
}
