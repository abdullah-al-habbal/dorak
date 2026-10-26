<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListBookingsQuery;
use Modules\Dashboard\Handlers\Bookings\ListBookingsHandler;
use Modules\Dashboard\Http\Requests\Business\ListBookingsRequest;
use Modules\Dashboard\Support\DashboardActor;

final class ListBookingsAction extends BaseApiAction
{
    public function __construct(private readonly ListBookingsHandler $handler) {}

    public function __invoke(ListBookingsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $bookings = $this->handler->handle(new ListBookingsQuery(
            $actor->scopedBranchIds(),
            $request->validated(),
        ));

        return $this->paginated($bookings, StaffBookingResource::class);
    }
}
