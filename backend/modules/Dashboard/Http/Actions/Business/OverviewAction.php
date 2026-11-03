<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Support\MinorUnits;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Constants\ServiceOverrideConstants;
use Modules\OfferedService\Queries\BookingServicePricing;

final class OverviewAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBranchIds();
        $bookings = BookingModel::query()->when($scope !== null, fn ($query) => $query->forBranches($scope ?? []));
        $branches = BranchModel::query()->when($scope !== null, fn ($query) => $query->whereKey($scope ?? []));

        $todayBookings = (clone $bookings)->whereBetween('starts_at', [now()->startOfDay(), now()->endOfDay()]);
        $activeChairs = ChairModel::query()->where('status', ChairStatus::Available)
            ->when($scope !== null, fn ($query) => $query->whereIn('branch_id', $scope ?? []));
        $completedBookings = (clone $bookings)->where('booking_status', BookingStatus::Completed);
        $completedToday = (clone $completedBookings)->whereBetween('starts_at', [now()->startOfDay(), now()->endOfDay()]);

        return $this->success([
            'active_chairs_count' => $activeChairs->count(),
            'bookings_count' => (clone $bookings)->count(),
            'completed_bookings_count' => (clone $completedBookings)->count(),
            'active_branches_count' => $branches->count(),
            'today_bookings_count' => $todayBookings->count(),
            'revenue' => $this->completedBookingsRevenue($completedToday),
            'revenue_currency' => $this->revenueCurrencyCode($scope),
            'stylists_count' => BarberModel::query()->when($scope !== null, fn ($query) => $query->whereIn('id', BookingModel::query()->forBranches($scope ?? [])->select('barber_id')))->count(),
        ]);
    }

    /**
     * The scoped actor's single brand currency when the scope resolves to
     * exactly one brand (a branch manager, or a brand owner who owns one
     * brand); otherwise (platform admin, or an owner spanning several
     * brands with different currencies) the platform default currency.
     * Revenue itself is not converted between currencies (see Task 72
     * decision note) — only the reported code may differ from a given
     * booking's own service currency.
     */
    private function revenueCurrencyCode(?array $branchIds): ?string
    {
        if ($branchIds !== null) {
            $brandIds = BranchModel::query()->whereIn('id', $branchIds)->pluck('brand_id')->unique();
            if ($brandIds->count() === 1) {
                $code = BrandModel::query()->whereKey($brandIds->first())->with('baseCurrency')->first()?->baseCurrency?->code;
                if ($code !== null) {
                    return $code;
                }
            }
        }

        return CurrencyModel::query()->where('is_default', true)->value('code')
            ?? CurrencyModel::query()->value('code');
    }

    /**
     * There is no payments/transactions module yet (Task 65 is spec-first and
     * pending product-owner approval), so revenue is derived from the price
     * of each service on a completed booking at read time.
     */
    private function completedBookingsRevenue(Builder $completedBookings): float
    {
        return MinorUnits::toMajor(BookingServicePricing::lines($completedBookings->select('bookings.id'))
            ->sum(DB::raw(ServiceOverrideConstants::SERVICE_OVERRIDE_EFFECTIVE_PRICE_SQL)));
    }
}
