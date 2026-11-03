<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Earnings;

use Modules\Dashboard\Constants\DashboardEarningsConstants;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Earnings\BarberEarningsEloquentResolver;
use Modules\Dashboard\Eloquent\Resolvers\Earnings\BranchEarningsEloquentResolver;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class ShowEarningsHandler
{
    public function __construct(
        private BranchEarningsEloquentResolver $branchEarnings,
        private BarberEarningsEloquentResolver $barberEarnings,
    ) {}

    /** @return array{scope: string, totals: list<array<string, mixed>>} */
    public function handle(ShowEarningsQuery $query): array
    {
        return match ($query->actorType) {
            DashboardActorTypeEnum::Barber => [
                'scope' => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BARBER,
                'totals' => $this->barberEarnings->resolve($query),
            ],
            DashboardActorTypeEnum::Owner => [
                'scope' => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BRAND,
                'totals' => $this->branchEarnings->resolve($query),
            ],
            default => [
                'scope' => DashboardEarningsConstants::DASHBOARD_EARNINGS_SCOPE_BRANCH,
                'totals' => $this->branchEarnings->resolve($query),
            ],
        };
    }
}
