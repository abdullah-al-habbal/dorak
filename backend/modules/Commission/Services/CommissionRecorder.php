<?php

declare(strict_types=1);

namespace Modules\Commission\Services;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Models\BookingModel;
use Modules\Commission\Constants\CommissionMoneyConstants;
use Modules\Commission\Enums\CommissionType;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Commission\Support\MinorUnits;

final class CommissionRecorder
{
    public function __construct(private readonly CommissionRuleResolver $rules) {}

    /**
     * Records the commission a completed booking owes its brand. Idempotent on
     * the booking; freelance bookings (no branch/brand) and bookings with no
     * applicable rule accrue nothing. A booking is priced in its first
     * service's currency.
     */
    public function record(BookingModel $booking): ?CommissionEntryModel
    {
        $branchId = $booking->branch_id ?? $booking->chair?->branch_id;
        $brandId = $branchId === null ? null : DB::table('branches')->where('id', $branchId)->value('brand_id');
        $services = DB::table('booking_offered_service')
            ->join('offered_services', 'offered_services.id', '=', 'booking_offered_service.offered_service_id')
            ->where('booking_offered_service.booking_id', $booking->getKey())
            ->get(['offered_services.price', 'offered_services.currency_id']);

        if ($brandId === null || $services->isEmpty()) {
            return null;
        }

        $currencyId = (string) $services->first()->currency_id;
        $base = MinorUnits::fromDecimal($services->where('currency_id', $currencyId)->sum('price'));
        $rule = $this->rules->resolve($branchId, (string) $brandId, $currencyId);
        if ($rule === null) {
            return null;
        }

        return CommissionEntryModel::query()->firstOrCreate(['booking_id' => $booking->getKey()], [
            'brand_id' => $brandId,
            'branch_id' => $branchId,
            'commission_rule_id' => $rule->getKey(),
            'rule_snapshot' => ['scope' => $rule->scope->value, 'type' => $rule->type->value, 'value' => $rule->value],
            'base_minor' => $base,
            'commission_minor' => $this->amount($rule, $base),
            'currency_id' => $currencyId,
        ]);
    }

    private function amount(CommissionRuleModel $rule, int $base): int
    {
        return match ($rule->type) {
            CommissionType::Percent => (int) round($base * $rule->value / CommissionMoneyConstants::COMMISSION_MONEY_BASIS_POINTS_DENOMINATOR),
            CommissionType::Flat => $rule->value,
        };
    }
}
