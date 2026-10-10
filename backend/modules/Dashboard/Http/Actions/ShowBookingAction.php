<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Handlers\Bookings\ShowBookingHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBookingAction extends BaseApiAction
{
    public function __construct(private readonly ShowBookingHandler $handler) {}

    public function __invoke(Request $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        return $this->ok(new BookingResource($this->handler->handle(new ShowBookingQuery($booking, $actor->isPlatformAdmin() ? null : $actor->branchId))));
    }
}
