<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Subscription\CQRS\Command\SavePlanCommand;
use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;

final class SavePlanRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'description.en' => ['nullable', 'string', 'max:2000'],
            'description.ar' => ['nullable', 'string', 'max:2000'],
            'price_amount_minor' => ['required', 'integer', 'min:0'],
            'currency_code' => ['required', 'exists:currencies,code'],
            'interval_unit' => ['required', Rule::enum(SubscriptionIntervalUnitEnum::class)],
            'interval_count' => ['required', 'integer', 'min:1', 'max:120'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'feature_keys' => ['sometimes', 'array'],
            'feature_keys.*' => ['string', 'distinct', Rule::in(BrandFeatures::keys())],
        ];
    }

    public function toCommand(): SavePlanCommand
    {
        $data = $this->validated();

        return new SavePlanCommand(
            name: $data['name'],
            description: $data['description'] ?? null,
            priceMinor: (int) $data['price_amount_minor'],
            currencyCode: $data['currency_code'],
            intervalUnit: SubscriptionIntervalUnitEnum::from($data['interval_unit']),
            intervalCount: (int) $data['interval_count'],
            isActive: (bool) $data['is_active'],
            sortOrder: (int) ($data['sort_order'] ?? 0),
            featureKeys: array_values($data['feature_keys'] ?? []),
        );
    }
}
