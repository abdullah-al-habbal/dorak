<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Commission\CQRS\Command\SaveCommissionRuleCommand;
use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;
use Modules\Commission\Support\MinorUnits;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SaveCommissionRuleRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $scope = $this->input('scope');

        return [
            'scope' => ['required', Rule::enum(CommissionScope::class)],
            'scope_id' => [
                Rule::requiredIf($scope === CommissionScope::Brand->value || $scope === CommissionScope::Branch->value),
                'nullable',
                'uuid',
                Rule::when($scope === CommissionScope::Brand->value, ['exists:brands,id']),
                Rule::when($scope === CommissionScope::Branch->value, ['exists:branches,id']),
                Rule::when($scope === CommissionScope::Global->value, ['prohibited']),
            ],
            'type' => ['required', Rule::enum(CommissionType::class)],
            'value' => [
                'required', 'integer', 'min:1',
                Rule::when($this->input('type') === CommissionType::Percent->value, ['max:'.MinorUnits::BASIS_POINTS_DENOMINATOR]),
            ],
            'currency_id' => [
                Rule::requiredIf($this->input('type') === CommissionType::Flat->value),
                'nullable', 'uuid', 'exists:currencies,id',
            ],
            'is_active' => ['required', 'boolean'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function toCommand(): SaveCommissionRuleCommand
    {
        $data = $this->validated();

        return new SaveCommissionRuleCommand(
            scope: CommissionScope::from($data['scope']),
            scopeId: $data['scope_id'] ?? null,
            type: CommissionType::from($data['type']),
            value: (int) $data['value'],
            currencyId: $data['currency_id'] ?? null,
            isActive: (bool) $data['is_active'],
            notes: $data['notes'] ?? null,
        );
    }
}
