<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Http\Requests\Admin\StoreExchangeRateRequest;
use Modules\Currency\Http\Resources\Shared\ExchangeRateResource;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;

final class StoreExchangeRateAction extends BaseApiAction
{
    public function __invoke(StoreExchangeRateRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', CurrencyModel::class);

        $input = $request->validated();
        $rate = ExchangeRateModel::query()->create([...$input, 'effective_at' => $input['effective_at'] ?? now()]);

        return $this->created(data: new ExchangeRateResource($rate->load(['fromCurrency', 'toCurrency'])), message: __('currency::messages.rate_saved'));
    }
}
