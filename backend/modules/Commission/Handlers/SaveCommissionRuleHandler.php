<?php

declare(strict_types=1);

namespace Modules\Commission\Handlers;

use Modules\Commission\CQRS\Command\SaveCommissionRuleCommand;
use Modules\Commission\Models\CommissionRuleModel;

final class SaveCommissionRuleHandler
{
    public function handle(SaveCommissionRuleCommand $command, ?CommissionRuleModel $rule = null): CommissionRuleModel
    {
        $attributes = [
            'scope' => $command->scope,
            'scope_id' => $command->scopeId,
            'type' => $command->type,
            'value_bps' => $command->valueBps,
            'value_amount_minor' => $command->valueAmountMinor,
            'currency_code' => $command->currencyCode,
            'is_active' => $command->isActive,
            'notes' => $command->notes,
        ];

        $rule === null ? $rule = CommissionRuleModel::create($attributes) : $rule->update($attributes);

        return $rule->load('currency');
    }
}
