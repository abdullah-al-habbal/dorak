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

final class StorePaymentGatewayAction extends BaseApiAction
{
    public function __construct(private readonly SavePaymentGatewayHandler $handler) {}

    public function __invoke(SavePaymentGatewayRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', PaymentGatewayModel::class);

        return $this->created(
            data: new PaymentGatewayResource($this->handler->handle($request->toCommand())),
            message: __('payment::messages.gateway_saved'),
        );
    }
}
