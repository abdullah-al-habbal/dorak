<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\WalkInServicesUnavailableException;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\WalkInStylistNotAssignedException;
use Modules\Dashboard\Handlers\Bookings\CreateWalkInBookingHandler;
use Modules\Dashboard\Http\Requests\Business\CreateWalkInBookingRequest;
use Modules\Dashboard\Support\DashboardActor;

final class CreateWalkInBookingAction extends BaseApiAction
{
    public function __construct(
        private readonly CreateWalkInBookingHandler $handler,
        private readonly BrandApprovalGuard $approvals,
    ) {}

    public function __invoke(CreateWalkInBookingRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $command = $request->toCommand();

        Gate::forUser($actor)->authorize('dashboard.booking.createWalkIn', $command->branchId);

        $this->approvals->ensureBranchBrandApproved($actor, $command->branchId);

        try {
            return $this->created(new StaffBookingResource($this->handler->handle($command)));
        } catch (ChairNotAvailableException|DoubleBookingException) {
            return $this->error('BOOKING_SLOT_CONFLICT', __('dashboard::messages.chair_stylist_unavailable'), 409);
        } catch (InvalidBookingServicesException $exception) {
            return $this->unprocessable(message: $exception->getMessage());
        } catch (BookingOutsideScheduleException) {
            return $this->error('booking_outside_schedule', __('booking::messages.time_outside_schedule'), 422);
        } catch (WalkInStylistNotAssignedException) {
            return $this->unprocessable(message: __('dashboard::messages.stylist_not_assigned_to_chair'));
        } catch (WalkInServicesUnavailableException) {
            return $this->unprocessable(message: __('dashboard::messages.services_unavailable_for_branch'));
        }
    }
}
