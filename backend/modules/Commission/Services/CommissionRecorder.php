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
            ->get(['offered_services.price', 'offered_services.currency_code']);

        if ($brandId === null || $services->isEmpty()) {
            return null;
        }

        $currencyCode = (string) $services->first()->currency_code;
        $base = MinorUnits::fromDecimal($services->where('currency_code', $currencyCode)->sum('price'));
        $rule = $this->rules->resolve($branchId, (string) $brandId, $currencyCode);
        if ($rule === null) {
            return null;
        }

        return CommissionEntryModel::query()->firstOrCreate(['booking_id' => $booking->getKey()], [
            'brand_id' => $brandId,
            'branch_id' => $branchId,
            'commission_rule_id' => $rule->getKey(),
            'rule_snapshot' => ['scope' => $rule->scope->value, 'type' => $rule->type->value, 'value_bps' => $rule->value_bps, 'value_amount_minor' => $rule->value_amount_minor],
            'base_amount_minor' => $base,
            'commission_amount_minor' => $this->amount($rule, $base),
            'currency_code' => $currencyCode,
        ]);
    }

    private function amount(CommissionRuleModel $rule, int $base): int
    {
        return match ($rule->type) {
            CommissionType::Percent => (int) round($base * (int) $rule->value_bps / CommissionMoneyConstants::COMMISSION_MONEY_BASIS_POINTS_DENOMINATOR),
            CommissionType::Flat => (int) $rule->value_amount_minor,
        };
    }
}
