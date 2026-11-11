<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Http\Requests\Admin\SaveCurrencyRequest;
use Modules\Currency\Http\Resources\Admin\AdminCurrencyResource;
use Modules\Currency\Models\CurrencyModel;

final class UpdateCurrencyAction extends BaseApiAction
{
    public function __invoke(SaveCurrencyRequest $request, string $currency): JsonResponse
    {
        $model = CurrencyModel::query()->findOrFail($currency);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminCurrencyResource($model->refresh()), message: __('currency::messages.currency_saved'));
    }
}
