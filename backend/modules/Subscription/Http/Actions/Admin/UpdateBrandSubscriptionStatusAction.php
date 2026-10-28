<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Handlers\UpdateSubscriptionStatusHandler;
use Modules\Subscription\Http\Requests\Admin\UpdateSubscriptionStatusRequest;
use Modules\Subscription\Http\Resources\Admin\BrandSubscriptionResource;
use Modules\Subscription\Models\BrandSubscriptionModel;

final class UpdateBrandSubscriptionStatusAction extends BaseApiAction
{
    public function __construct(private readonly UpdateSubscriptionStatusHandler $handler) {}

    public function __invoke(UpdateSubscriptionStatusRequest $request, string $subscription): JsonResponse
    {
        $model = BrandSubscriptionModel::query()->findOrFail($subscription);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $from = $model->status->value;
        $updated = $this->handler->handle($model, $request->status());
        if ($updated === null) {
            return $this->businessError(
                ErrorCodeEnum::CONFLICT,
                __('subscription::messages.invalid_transition', ['from' => $from, 'to' => $request->status()->value]),
            );
        }

        return $this->ok(
            data: new BrandSubscriptionResource($updated->load(['brand', 'plan'])),
            message: __('subscription::messages.subscription_updated'),
        );
    }
}
