<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Handlers\TransitionPayoutHandler;
use Modules\Payout\Http\Requests\Admin\TransitionPayoutRequest;
use Modules\Payout\Http\Resources\Admin\PayoutResource;
use Modules\Payout\Models\PayoutModel;

final class CancelPayoutAction extends BaseApiAction
{
    public function __construct(private readonly TransitionPayoutHandler $handler) {}

    public function __invoke(TransitionPayoutRequest $request, string $payout): JsonResponse
    {
        $model = PayoutModel::query()->findOrFail($payout);
        Gate::forUser($request->user('admin_api'))->authorize('cancel', $model);

        $from = $model->status->value;
        $updated = $this->handler->handle($model, $request->toCommand(PayoutStatus::Cancelled));
        if ($updated === null) {
            return $this->businessError(
                ErrorCodeEnum::CONFLICT,
                __('payout::messages.invalid_transition', ['from' => $from, 'to' => PayoutStatus::Cancelled->value]),
            );
        }

        return $this->ok(data: new PayoutResource($updated), message: __('payout::messages.updated'));
    }
}
