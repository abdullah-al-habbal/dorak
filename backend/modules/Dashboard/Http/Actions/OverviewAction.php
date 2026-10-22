<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return $this->success([
            'active_chairs_count' => $activeChairs->count(),
            'bookings_count' => (clone $bookings)->count(),
            'completed_bookings_count' => (clone $bookings)->where('status', BookingStatus::Completed)->count(),
            'active_branches_count' => $branches->count(),
            'today_bookings_count' => $todayBookings->count(),
            'revenue' => 0.0,
            'stylists_count' => BarberModel::query()->when($scope !== null, fn ($query) => $query->whereIn('id', BookingModel::query()->forBranches($scope ?? [])->select('barber_id')))->count(),
        ]);
    }
}
