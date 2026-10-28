<?php

declare(strict_types=1);

namespace Modules\Payout\Handlers;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Payout\Enums\PayoutDirection;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;

final class GeneratePayoutsHandler
{
    /**
     * Gathers every unsettled commission entry into one draft payout per brand
     * and currency. Entries already attached to a payout are never touched.
     *
     * @return Collection<int, PayoutModel>
     */
    public function handle(): Collection
    {
        return DB::transaction(function (): Collection {
            $entries = CommissionEntryModel::query()->whereNull('payout_id')->lockForUpdate()->get();

            return $entries->groupBy(fn (CommissionEntryModel $entry): string => $entry->brand_id.'|'.$entry->currency_id)
                ->map(function (Collection $group): PayoutModel {
                    /** @var CommissionEntryModel $first */
                    $first = $group->first();
                    $payout = PayoutModel::create([
                        'brand_id' => $first->brand_id,
                        'currency_id' => $first->currency_id,
                        'direction' => PayoutDirection::BrandToPlatform,
                        'status' => PayoutStatus::Draft,
                        'total_minor' => (int) $group->sum('commission_minor'),
                        'period_start' => $group->min('created_at'),
                        'period_end' => $group->max('created_at'),
                    ]);
                    CommissionEntryModel::query()->whereIn('id', $group->modelKeys())->update(['payout_id' => $payout->getKey()]);

                    return $payout->load(['brand', 'currency']);
                })
                ->values();
        });
    }
}
