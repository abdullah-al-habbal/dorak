<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payment\Handlers\SavePaymentGatewayHandler;
use Modules\Payment\Http\Requests\Admin\SavePaymentGatewayRequest;
use Modules\Payment\Http\Resources\Admin\PaymentGatewayResource;
use Modules\Payment\Models\PaymentGatewayModel;

final class UpdatePaymentGatewayAction extends BaseApiAction
{
    public function __construct(private readonly SavePaymentGatewayHandler $handler) {}

    public function __invoke(SavePaymentGatewayRequest $request, string $gateway): JsonResponse
    {
        $model = PaymentGatewayModel::query()->findOrFail($gateway);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        return $this->ok(
            data: new PaymentGatewayResource($this->handler->handle($request->toCommand(), $model)),
            message: __('payment::messages.gateway_saved'),
        );
    }
}
