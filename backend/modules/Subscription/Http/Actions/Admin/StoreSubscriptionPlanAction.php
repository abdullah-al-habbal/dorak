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

final class StoreSubscriptionPlanAction extends BaseApiAction
{
    public function __construct(private readonly SavePlanHandler $handler) {}

    public function __invoke(SavePlanRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', SubscriptionPlanModel::class);

        return $this->created(
            data: new SubscriptionPlanResource($this->handler->handle($request->toCommand())),
            message: __('subscription::messages.plan_saved'),
        );
    }
}
