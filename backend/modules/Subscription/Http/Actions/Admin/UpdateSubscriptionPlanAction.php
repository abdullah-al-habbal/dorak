<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Handlers\SavePlanHandler;
use Modules\Subscription\Http\Requests\Admin\SavePlanRequest;
use Modules\Subscription\Http\Resources\Admin\SubscriptionPlanResource;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class UpdateSubscriptionPlanAction extends BaseApiAction
{
    public function __construct(private readonly SavePlanHandler $handler) {}

    public function __invoke(SavePlanRequest $request, string $plan): JsonResponse
    {
        $model = SubscriptionPlanModel::query()->findOrFail($plan);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        return $this->ok(
            data: new SubscriptionPlanResource($this->handler->handle($request->toCommand(), $model)),
            message: __('subscription::messages.plan_saved'),
        );
    }
}
