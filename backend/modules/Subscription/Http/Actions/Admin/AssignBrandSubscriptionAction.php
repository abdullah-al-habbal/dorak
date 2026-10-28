<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Handlers\AssignSubscriptionHandler;
use Modules\Subscription\Http\Requests\Admin\AssignSubscriptionRequest;
use Modules\Subscription\Http\Resources\Admin\BrandSubscriptionResource;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class AssignBrandSubscriptionAction extends BaseApiAction
{
    public function __construct(private readonly AssignSubscriptionHandler $handler) {}

    public function __invoke(AssignSubscriptionRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', BrandSubscriptionModel::class);

        $command = $request->toCommand();
        if (! SubscriptionPlanModel::query()->findOrFail($command->planId)->is_active) {
            return $this->businessError(ErrorCodeEnum::UNPROCESSABLE_ENTITY, __('subscription::messages.plan_inactive'));
        }

        return $this->created(
            data: new BrandSubscriptionResource($this->handler->handle($command)),
            message: __('subscription::messages.subscription_assigned'),
        );
    }
}
