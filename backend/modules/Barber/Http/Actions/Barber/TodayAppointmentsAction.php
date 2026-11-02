<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class TodayAppointmentsAction extends BaseApiAction
{
    public function __invoke(): JsonResponse
    {
        $appointments = BookingModel::query()->where('barber_id', Auth::guard('barber')->id())
            ->whereDate('starts_at', today())->with(['chair', 'client' => fn ($query) => $query->withReputation(), 'services'])->orderBy('starts_at')->paginate(30);

        return $this->paginated(paginator: $appointments, resourceClass: StaffBookingResource::class);
    }
}
