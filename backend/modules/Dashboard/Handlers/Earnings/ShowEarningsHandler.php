<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Earnings;

use Modules\Dashboard\Constants\DashboardEarningsConstants;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Earnings\BarberEarningsEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Earnings\BranchEarningsEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Earnings\EarningsSeriesEloquentResolver;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class ShowEarningsHandler
{
    public function __construct(
        private BranchEarningsEloquentResolver $branchEarnings,
        private BarberEarningsEloquentResolver $barberEarnings,
        private EarningsSeriesEloquentResolver $series,
    ) {}

    /**
     * `totals` keeps its original shape. `series` (per day and currency) and, when the
     * request carries a full range, `previous_totals` for the equal range just before it
     * are additive fields.
     *
     * @return array{scope: string, totals: list<array<string, mixed>>, series: list<array<string, mixed>>, previous_period: array{from: string, to: string}|null, previous_totals: list<array<string, mixed>>|null}
     */
    public function handle(ShowEarningsQuery $query): array
    {
        $previous = $this->previousQuery($query);

        return [
            'scope' => $this->scopeFor($query),
            'totals' => $this->totalsFor($query),
            'series' => $this->series->resolve($query),
            'previous_period' => $previous === null ? null : [
                'from' => $previous->from->toDateString(),
                'to' => $previous->to->toDateString(),
            ],
            'previous_totals' => $previous === null ? null : $this->totalsFor($previous),
        ];
    }

    private function scopeFor(ShowEarningsQuery $query): string
    {
        return match ($query->actorType) {
            DashboardActorTypeEnum::Barber => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BARBER,
            DashboardActorTypeEnum::Owner => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BRAND,
            default => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BRANCH,
        };
    }

    /** @return list<array<string, mixed>> */
    private function totalsFor(ShowEarningsQuery $query): array
    {
        return $query->actorType === DashboardActorTypeEnum::Barber
            ? $this->barberEarnings->resolve($query)
            : $this->branchEarnings->resolve($query);
    }

    /** The range of equal length that ends the second before this one starts. */
    private function previousQuery(ShowEarningsQuery $query): ?ShowEarningsQuery
    {
        if ($query->from === null || $query->to === null) {
            return null;
        }

        $days = (int) $query->from->copy()->startOfDay()->diffInDays($query->to->copy()->startOfDay()) + 1;

        return new ShowEarningsQuery(
            $query->actorType,
            $query->actorId,
            $query->branchIds,
            $query->from->copy()->subDays($days),
            $query->from->copy()->subSecond(),
        );
    }
}
