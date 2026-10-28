<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payment\Http\Resources\Admin\PaymentGatewayResource;
use Modules\Payment\Models\PaymentGatewayModel;

final class ListPaymentGatewaysAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', PaymentGatewayModel::class);

        $gateways = PaymentGatewayModel::query()->orderBy('sort_order')->orderBy('code')->get();

        return $this->ok(data: PaymentGatewayResource::collection($gateways));
    }
}
