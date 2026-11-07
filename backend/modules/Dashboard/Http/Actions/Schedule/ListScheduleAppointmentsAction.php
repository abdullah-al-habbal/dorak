<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Schedule;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListScheduleAppointmentsQuery;
use Modules\Dashboard\Handlers\Schedule\ListScheduleAppointmentsHandler;
use Modules\Dashboard\Http\Requests\Business\ListScheduleAppointmentsRequest;
use Modules\Dashboard\Support\DashboardActor;

/** The signed-in barber's own appointments for the dashboard schedule (the Operations routes reject barbers). */
final class ListScheduleAppointmentsAction extends BaseApiAction
{
    public function __construct(private readonly ListScheduleAppointmentsHandler $handler) {}

    public function __invoke(ListScheduleAppointmentsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('viewOwn', BarberScheduleModel::class);

        $appointments = $this->handler->handle(new ListScheduleAppointmentsQuery(
            $actor->id,
            $request->perPage(),
            $request->enum('booking_status', BookingStatus::class),
            $request->validated('date_from'),
            $request->validated('date_to'),
        ));

        return $this->paginated($appointments, StaffBookingResource::class);
    }
}
