<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Support\MinorUnits;

final class DashboardAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        if (! $branch instanceof BranchModel) {
            return $this->unauthorized();
        }
        $today = now()->startOfDay();

        $stats = [
            'today_bookings' => BookingModel::query()->forBranch($branch->id)
                ->where('starts_at', '>=', $today)->count(),
            'active_chairs' => ChairModel::where('branch_id', $branch->id)->where('status', ChairStatus::Available)->count(),
            'total_chairs' => ChairModel::where('branch_id', $branch->id)->count(),
            'pending_affiliations' => BarberAffiliationModel::where('affiliable_id', $branch->id)
                ->where('affiliable_type', AffiliableType::Branch)->where('status', AffiliationStatus::Pending)->count(),
            'today_revenue' => MinorUnits::toMajor(BookingModel::query()
                ->forBranch($branch->id)
                ->where('booking_status', BookingStatus::Completed)
                ->whereDate('starts_at', today())
                ->join('booking_offered_service', 'bookings.id', '=', 'booking_offered_service.booking_id')
                ->join('offered_services', 'booking_offered_service.offered_service_id', '=', 'offered_services.id')
                ->sum('offered_services.price_amount_minor')),
            'monthly_revenue' => MinorUnits::toMajor(BookingModel::query()
                ->forBranch($branch->id)
                ->where('booking_status', BookingStatus::Completed)
                ->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->join('booking_offered_service', 'bookings.id', '=', 'booking_offered_service.booking_id')
                ->join('offered_services', 'booking_offered_service.offered_service_id', '=', 'offered_services.id')
                ->sum('offered_services.price_amount_minor')),
            'chair_status_counts' => ChairModel::query()->where('branch_id', $branch->id)
                ->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'assigned_branches' => [['id' => $branch->id, 'name' => $branch->getAttribute('name')]],
        ];

        return $this->success($stats, SuccessCodeEnum::SUCCESS);
    }
}
