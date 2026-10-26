<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class OverviewAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBranchIds();
        $bookings = BookingModel::query()->when($scope !== null, fn ($query) => $query->forBranches($scope ?? []));
        $branches = BranchModel::query()->when($scope !== null, fn ($query) => $query->whereKey($scope ?? []));

        $todayBookings = (clone $bookings)->whereBetween('time_slot', [now()->startOfDay(), now()->endOfDay()]);
        $activeChairs = ChairModel::query()->where('status', 'available')
            ->when($scope !== null, fn ($query) => $query->whereIn('branch_id', $scope ?? []));
        $completedBookings = (clone $bookings)->where('status', BookingStatus::Completed);

        return $this->success([
            'active_chairs_count' => $activeChairs->count(),
            'bookings_count' => (clone $bookings)->count(),
            'completed_bookings_count' => (clone $completedBookings)->count(),
            'active_branches_count' => $branches->count(),
            'today_bookings_count' => $todayBookings->count(),
            'revenue' => $this->completedBookingsRevenue($completedBookings),
            'stylists_count' => BarberModel::query()->when($scope !== null, fn ($query) => $query->whereIn('id', BookingModel::query()->forBranches($scope ?? [])->select('barber_id')))->count(),
        ]);
    }

    /**
     * There is no payments/transactions module yet (Task 65 is spec-first and
     * pending product-owner approval), so revenue is derived from the price
     * of each service on a completed booking at read time.
     */
    private function completedBookingsRevenue(Builder $completedBookings): float
    {
        return (float) DB::table('booking_offered_service')
            ->join('offered_services', 'offered_services.id', '=', 'booking_offered_service.offered_service_id')
            ->whereIn('booking_offered_service.booking_id', $completedBookings->select('bookings.id'))
            ->sum('offered_services.price');
    }
}
