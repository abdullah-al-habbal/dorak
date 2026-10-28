<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payout\Handlers\GeneratePayoutsHandler;
use Modules\Payout\Http\Resources\Admin\PayoutResource;
use Modules\Payout\Models\PayoutModel;

final class GeneratePayoutsAction extends BaseApiAction
{
    public function __construct(private readonly GeneratePayoutsHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', PayoutModel::class);

        $payouts = $this->handler->handle();

        return $this->created(
            data: PayoutResource::collection($payouts),
            message: __('payout::messages.generated', ['count' => $payouts->count()]),
        );
    }
}
