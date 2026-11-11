<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;

/** Removes one entry of a pair's history (a mistaken rate); the converter then falls back to the previous one. */
final class DestroyExchangeRateAction extends BaseApiAction
{
    public function __invoke(Request $request, string $rate): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', CurrencyModel::class);

        ExchangeRateModel::query()->findOrFail($rate)->delete();

        return $this->deleted(message: __('currency::messages.rate_deleted'));
    }
}
