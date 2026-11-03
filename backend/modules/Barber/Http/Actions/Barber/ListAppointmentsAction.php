<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Http\Requests\Barber\ListAppointmentsRequest;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** Paginated appointment history of the authenticated barber (newest first), filterable by status and date range. */
final class ListAppointmentsAction extends BaseApiAction
{
    public function __invoke(ListAppointmentsRequest $request): JsonResponse
    {
        /** @var BarberModel $barber */
        $barber = $request->user('barber');
        Gate::forUser($barber)->authorize('viewOwnHistory', BookingModel::class);

        $appointments = BookingModel::query()
            ->where('barber_id', $barber->getKey())
            ->when($request->validated('status'), fn ($query, string $status) => $query->where('booking_status', $status))
            ->when($request->validated('from'), fn ($query, string $from) => $query->whereDate('starts_at', '>=', $from))
            ->when($request->validated('to'), fn ($query, string $to) => $query->whereDate('starts_at', '<=', $to))
            ->with(['chair', 'client' => fn ($query) => $query->withReputation(), 'services'])
            ->orderByDesc('starts_at')
            ->paginate($request->perPage());

        return $this->paginated(paginator: $appointments, resourceClass: StaffBookingResource::class);
    }
}
