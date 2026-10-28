<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Commission\Handlers\SaveCommissionRuleHandler;
use Modules\Commission\Http\Requests\Admin\SaveCommissionRuleRequest;
use Modules\Commission\Http\Resources\Admin\CommissionRuleResource;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateCommissionRuleAction extends BaseApiAction
{
    public function __construct(private readonly SaveCommissionRuleHandler $handler) {}

    public function __invoke(SaveCommissionRuleRequest $request, string $rule): JsonResponse
    {
        $model = CommissionRuleModel::query()->findOrFail($rule);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        return $this->ok(
            data: new CommissionRuleResource($this->handler->handle($request->toCommand(), $model)),
            message: __('commission::messages.rule_saved'),
        );
    }
}
