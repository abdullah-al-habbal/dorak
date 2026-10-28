<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Handlers\DeletePlanHandler;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class DestroySubscriptionPlanAction extends BaseApiAction
{
    public function __construct(private readonly DeletePlanHandler $handler) {}

    public function __invoke(Request $request, string $plan): JsonResponse
    {
        $model = SubscriptionPlanModel::query()->findOrFail($plan);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);

        if (! $this->handler->handle($model)) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('subscription::messages.plan_in_use'));
        }

        return $this->ok(message: __('subscription::messages.plan_deleted'));
    }
}
