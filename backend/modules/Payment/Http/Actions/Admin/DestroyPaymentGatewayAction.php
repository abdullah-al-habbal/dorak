<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payment\Handlers\DeletePaymentGatewayHandler;
use Modules\Payment\Models\PaymentGatewayModel;

final class DestroyPaymentGatewayAction extends BaseApiAction
{
    public function __construct(private readonly DeletePaymentGatewayHandler $handler) {}

    public function __invoke(Request $request, string $gateway): JsonResponse
    {
        $model = PaymentGatewayModel::query()->findOrFail($gateway);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);

        if (! $this->handler->handle($model)) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('payment::messages.gateway_protected'));
        }

        return $this->ok(message: __('payment::messages.gateway_deleted'));
    }
}
