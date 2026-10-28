<?php

declare(strict_types=1);

namespace Modules\Commission\Services;

use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;
use Modules\Commission\Models\CommissionRuleModel;

/** Picks the rule that applies: branch beats brand beats global; newest wins a tie. */
final class CommissionRuleResolver
{
    public function resolve(?string $branchId, string $brandId, string $currencyId): ?CommissionRuleModel
    {
        return CommissionRuleModel::query()
            ->where('is_active', true)
            ->where(function ($query) use ($branchId, $brandId): void {
                $query->where('scope', CommissionScope::Global)
                    ->orWhere(fn ($q) => $q->where('scope', CommissionScope::Brand)->where('scope_id', $brandId))
                    ->orWhere(fn ($q) => $q->where('scope', CommissionScope::Branch)->where('scope_id', $branchId));
            })
            ->get()
            ->filter(fn (CommissionRuleModel $rule): bool => $rule->type === CommissionType::Percent || $rule->currency_id === $currencyId)
            ->sortBy([
                fn (CommissionRuleModel $a, CommissionRuleModel $b): int => $a->scope->precedence() <=> $b->scope->precedence(),
                fn (CommissionRuleModel $a, CommissionRuleModel $b): int => $b->created_at <=> $a->created_at,
            ])
            ->first();
    }
}
