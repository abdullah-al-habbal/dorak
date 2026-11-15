<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Database\Query\Builder;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Currency\Rules\ActiveCurrencyRule;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

final class ServiceRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['serviceable_id' => ['required', 'uuid'], 'serviceable_type' => ['required', Rule::enum(ServiceableTypeEnum::class)], 'catalog_item_id' => ['nullable', 'uuid', Rule::exists('service_catalog_items', 'id')->where('is_active', true)], 'category_id' => ['nullable', 'uuid', $this->categoryRule()], 'currency_code' => ['required', 'string', new ActiveCurrencyRule], 'name' => ['required', 'array:en,ar'], 'name.en' => ['required', 'string', 'max:120'], 'name.ar' => ['required', 'string', 'max:120'], 'price_amount_minor' => ['required', 'integer', 'min:0'], 'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'], 'is_active' => ['sometimes', 'boolean'], 'is_at_home' => ['sometimes', 'boolean']];
    }

    /**
     * New assignments need an active category. On update the service may keep the category it
     * already has after an admin deactivated it, so editing its price never forces a re-pick.
     */
    private function categoryRule(): Exists
    {
        $service = $this->route('service');
        $current = is_string($service) ? OfferedServiceModel::query()->whereKey($service)->value('category_id') : null;

        return Rule::exists('service_catalog_categories', 'id')
            ->whereNull('deleted_at')
            ->where(fn (Builder $query) => $query->where('is_active', true)->when(
                is_string($current),
                fn (Builder $kept) => $kept->orWhere('id', $current),
            ));
    }
}
