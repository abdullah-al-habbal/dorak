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
        $bookings = BookingModel::query()->when(! $actor->isPlatformAdmin(), fn ($query) => $query->whereHas('chair', fn ($chair) => $chair->where('branch_id', $actor->branchId)));
        $branches = BranchModel::query()->when(! $actor->isPlatformAdmin(), fn ($query) => $query->whereKey($actor->branchId));

        $todayBookings = (clone $bookings)->whereBetween('time_slot', [now()->startOfDay(), now()->endOfDay()]);
        $activeChairs = ChairModel::query()->where('status', 'available')
            ->when(! $actor->isPlatformAdmin(), fn ($query) => $query->where('branch_id', $actor->branchId));

        return $this->success([
            'active_chairs_count' => $activeChairs->count(),
            'bookings_count' => (clone $bookings)->count(),
            'completed_bookings_count' => (clone $bookings)->where('status', BookingStatus::Completed)->count(),
            'active_branches_count' => $branches->count(),
            'today_bookings_count' => $todayBookings->count(),
            'revenue' => 0.0,
            'stylists_count' => BarberModel::query()->when(! $actor->isPlatformAdmin(), fn ($query) => $query->whereHas('bookings.chair', fn ($chair) => $chair->where('branch_id', $actor->branchId)))->count(),
        ]);
    }
}
