<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use Illuminate\Support\Collection;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

/** A branch's bookable menu: the shop's own and brand services plus those of its seated barbers, with effective terms attached. */
final class BranchMenu
{
    public function __construct(private readonly EffectiveServiceTerms $serviceTerms) {}

    /**
     * @param  Collection<int, BarberModel>  $barbers
     * @return Collection<int, OfferedServiceModel>
     */
    public function build(BranchModel $branch, Collection $barbers): Collection
    {
        $brandId = $branch->getAttribute('brand_id') === null ? null : (string) $branch->getAttribute('brand_id');

        $menu = OfferedServiceModel::query()
            ->bookable()
            ->offeredAtShop($brandId)
            ->orderBy('serviceable_type')
            ->orderBy('price_amount_minor')
            ->get()
            ->concat($barbers->flatMap(fn (BarberModel $barber) => $barber->services))
            ->unique('id')
            ->values();

        $this->serviceTerms->attach($menu, $brandId);

        return $menu;
    }
}
