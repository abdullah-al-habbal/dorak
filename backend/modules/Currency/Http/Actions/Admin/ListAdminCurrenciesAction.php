<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Currency\Http\Resources\Admin\AdminCurrencyResource;
use Modules\Currency\Models\CurrencyModel;

/** Every currency, retired ones included, so the admin can bring one back. */
final class ListAdminCurrenciesAction extends BaseApiAction
{
    public function __invoke(): JsonResponse
    {
        return $this->ok(data: AdminCurrencyResource::collection(CurrencyModel::query()->orderBy('code')->get()));
    }
}
