<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Booking\Http\Resources\Staff\StaffBookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListBookingsAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        Gate::forUser($branch)->authorize('manage', $branch);

        $bookings = BookingModel::query()->forBranch($branch->id)
            ->with(['chair', 'client' => fn ($query) => $query->withReputation(), 'services'])
            ->orderByDesc('starts_at')
            ->paginate($request->input('per_page', 15));

        return $this->paginated($bookings, StaffBookingResource::class);
    }
}
