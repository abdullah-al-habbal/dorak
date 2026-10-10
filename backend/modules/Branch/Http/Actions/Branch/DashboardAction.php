<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class DashboardAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        if (! $branch instanceof BranchModel) {
            abort(401);
        }
        $today = now()->startOfDay();

        $stats = [
            'today_bookings' => BookingModel::whereHas('chair', fn ($q) => $q->where('branch_id', $branch->id))
                ->where('time_slot', '>=', $today)->count(),
            'active_chairs' => ChairModel::where('branch_id', $branch->id)->where('status', ChairStatus::Available)->count(),
            'total_chairs' => ChairModel::where('branch_id', $branch->id)->count(),
            'pending_affiliations' => BarberAffiliationModel::where('affiliable_id', $branch->id)
                ->where('affiliable_type', 'branch')->where('status', 'pending')->count(),
            'today_revenue' => (float) BookingModel::query()
                ->whereHas('chair', fn ($q) => $q->where('branch_id', $branch->id))
                ->where('status', BookingStatus::Completed)
                ->whereDate('time_slot', today())
                ->join('booking_offered_service', 'bookings.id', '=', 'booking_offered_service.booking_id')
                ->join('offered_services', 'booking_offered_service.offered_service_id', '=', 'offered_services.id')
                ->sum('offered_services.price'),
            'monthly_revenue' => (float) BookingModel::query()
                ->whereHas('chair', fn ($q) => $q->where('branch_id', $branch->id))
                ->where('status', BookingStatus::Completed)
                ->whereBetween('time_slot', [now()->startOfMonth(), now()->endOfMonth()])
                ->join('booking_offered_service', 'bookings.id', '=', 'booking_offered_service.booking_id')
                ->join('offered_services', 'booking_offered_service.offered_service_id', '=', 'offered_services.id')
                ->sum('offered_services.price'),
            'chair_status_counts' => ChairModel::query()->where('branch_id', $branch->id)
                ->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'assigned_branches' => [['id' => $branch->id, 'name' => $branch->getAttribute('name')]],
        ];

        return $this->success($stats, SuccessCodeEnum::SUCCESS);
    }
}
