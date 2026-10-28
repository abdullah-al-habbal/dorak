<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payment\Handlers\SetPaymentGatewayActiveHandler;
use Modules\Payment\Http\Requests\Admin\SetPaymentGatewayActiveRequest;
use Modules\Payment\Http\Resources\Admin\PaymentGatewayResource;
use Modules\Payment\Models\PaymentGatewayModel;

final class SetPaymentGatewayActiveAction extends BaseApiAction
{
    public function __construct(private readonly SetPaymentGatewayActiveHandler $handler) {}

    public function __invoke(SetPaymentGatewayActiveRequest $request, string $gateway): JsonResponse
    {
        $model = PaymentGatewayModel::query()->findOrFail($gateway);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        if (! $this->handler->handle($model, $request->boolean('is_active'))) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('payment::messages.gateway_protected'));
        }

        return $this->ok(data: new PaymentGatewayResource($model->refresh()), message: __('payment::messages.gateway_saved'));
    }
}
