<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Http\Requests\Admin\SaveCurrencyRequest;
use Modules\Currency\Http\Resources\Admin\AdminCurrencyResource;
use Modules\Currency\Models\CurrencyModel;

final class StoreCurrencyAction extends BaseApiAction
{
    public function __invoke(SaveCurrencyRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', CurrencyModel::class);

        $currency = CurrencyModel::query()->create([...$request->validated(), 'is_default' => false, 'is_active' => true]);

        return $this->created(data: new AdminCurrencyResource($currency), message: __('currency::messages.currency_saved'));
    }
}
