<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
use Modules\OfferedService\Constants\ServiceOverrideConstants;
use Modules\OfferedService\Queries\BookingServicePricing;

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
            'today_revenue' => $this->revenue(BookingModel::query()
                ->forBranch($branch->id)
                ->where('booking_status', BookingStatus::Completed)
                ->whereDate('starts_at', today())),
            'monthly_revenue' => $this->revenue(BookingModel::query()
                ->forBranch($branch->id)
                ->where('booking_status', BookingStatus::Completed)
                ->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])),
            'chair_status_counts' => ChairModel::query()->where('branch_id', $branch->id)
                ->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'assigned_branches' => [['id' => $branch->id, 'name' => $branch->getAttribute('name')]],
        ];

        return $this->success($stats, SuccessCodeEnum::SUCCESS);
    }

    /** Revenue of the given completed bookings at the prices their brand charges (Gap G6). */
    private function revenue(Builder $completedBookings): float
    {
        return MinorUnits::toMajor(BookingServicePricing::lines($completedBookings->select('bookings.id'))
            ->sum(DB::raw(ServiceOverrideConstants::SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL)));
    }
}
