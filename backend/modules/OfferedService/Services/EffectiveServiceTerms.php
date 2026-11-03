<?php

declare(strict_types=1);

namespace Modules\OfferedService\Services;

use Illuminate\Support\Collection;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\OfferedService\Constants\ServiceOverrideConstants;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\BarberServiceOverrideModel;
use Modules\OfferedService\Models\OfferedServiceModel;

/**
 * Resolves the price and duration a brand charges for a barber's service
 * (Gap G6): the brand's override when one exists, else the barber's default.
 * Overrides are scoped per brand, so one brand never affects another.
 */
final class EffectiveServiceTerms
{
    /**
     * Marks each service with the override `$brandId` set for it (or with none),
     * so the model's `effective*` accessors and the resources reflect the brand.
     * One query for the whole set; brand-owned services never carry overrides.
     *
     * @param  iterable<OfferedServiceModel>  $services
     */
    public function attach(iterable $services, ?string $brandId): void
    {
        $barberServices = Collection::make($services)
            ->filter(fn (OfferedServiceModel $service): bool => $service->getAttribute('serviceable_type') === ServiceableTypeEnum::Barber);

        if ($barberServices->isEmpty()) {
            return;
        }

        $overrides = $brandId === null
            ? Collection::make()
            : BarberServiceOverrideModel::query()
                ->where('brand_id', $brandId)
                ->whereIn('offered_service_id', $barberServices->map->getKey()->all())
                ->get()
                ->keyBy('offered_service_id');

        foreach ($barberServices as $service) {
            $service->setRelation(ServiceOverrideConstants::SERVICE_OVERRIDE_ACTIVE_RELATION, $overrides->get($service->getKey()));
        }
    }

    public function brandIdForBranch(?string $branchId): ?string
    {
        if ($branchId === null) {
            return null;
        }

        $brandId = BranchModel::query()->whereKey($branchId)->value('brand_id');

        return is_string($brandId) ? $brandId : null;
    }

    /**
     * Override prices that apply to completed bookings, by the branch each was
     * served in then by service id: `[branchId][serviceId] => price_amount_minor`.
     * Two queries for the whole set; used where prices are summed in memory.
     *
     * @param  iterable<BookingModel>  $bookings  with `services` and `chair` loaded
     * @return array<string, array<string, int>>
     */
    public function priceOverridesFor(iterable $bookings): array
    {
        $bookings = Collection::make($bookings);
        $branchIds = $bookings->map(fn (BookingModel $booking) => $booking->branch_id ?? $booking->chair?->branch_id)->filter()->unique()->values();
        $brandByBranch = BranchModel::query()->whereIn('id', $branchIds)->pluck('brand_id', 'id');
        $serviceIds = $bookings->flatMap(fn (BookingModel $booking) => $booking->services->modelKeys())->unique()->values();

        $overrides = BarberServiceOverrideModel::query()
            ->whereIn('brand_id', $brandByBranch->filter()->unique()->values())
            ->whereIn('offered_service_id', $serviceIds)
            ->whereNotNull('price_amount_minor')
            ->get()
            ->groupBy('brand_id');

        $prices = [];

        foreach ($brandByBranch as $branchId => $brandId) {
            foreach ($overrides->get($brandId, []) as $override) {
                $prices[(string) $branchId][$override->offered_service_id] = (int) $override->price_amount_minor;
            }
        }

        return $prices;
    }
}
