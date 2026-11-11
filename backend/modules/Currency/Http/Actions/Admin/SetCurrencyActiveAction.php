<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Http\Requests\Admin\SetCurrencyActiveRequest;
use Modules\Currency\Http\Resources\Admin\AdminCurrencyResource;
use Modules\Currency\Models\CurrencyModel;

/**
 * Retires or restores a currency. A currency is never deleted because brands, prices and payouts refer to it;
 * retiring only stops it being offered for new prices. The platform default can't be retired.
 */
final class SetCurrencyActiveAction extends BaseApiAction
{
    public function __invoke(SetCurrencyActiveRequest $request, string $currency): JsonResponse
    {
        $model = CurrencyModel::query()->findOrFail($currency);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        if ($model->is_default && ! $request->boolean('is_active')) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('currency::messages.default_cannot_retire'));
        }

        $model->update(['is_active' => $request->boolean('is_active')]);

        return $this->updated(data: new AdminCurrencyResource($model->refresh()), message: __('currency::messages.currency_saved'));
    }
}
