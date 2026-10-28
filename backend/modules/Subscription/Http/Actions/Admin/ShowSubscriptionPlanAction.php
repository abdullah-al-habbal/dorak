<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Http\Resources\Admin\SubscriptionPlanResource;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class ShowSubscriptionPlanAction extends BaseApiAction
{
    public function __invoke(Request $request, string $plan): JsonResponse
    {
        $model = SubscriptionPlanModel::query()->with(['currency', 'features'])->findOrFail($plan);
        Gate::forUser($request->user('admin_api'))->authorize('view', $model);

        return $this->ok(data: new SubscriptionPlanResource($model));
    }
}
