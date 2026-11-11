<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payout\Http\Resources\Admin\PayoutResource;
use Modules\Payout\Models\PayoutModel;

final class ShowPayoutAction extends BaseApiAction
{
    public function __invoke(Request $request, string $payout): JsonResponse
    {
        $model = PayoutModel::query()->with(['brand', 'currency', 'approver'])->findOrFail($payout);
        Gate::forUser($request->user('admin_api'))->authorize('view', $model);

        return $this->ok(data: new PayoutResource($model));
    }
}
