<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class DestroyCommissionRuleAction extends BaseApiAction
{
    public function __invoke(Request $request, string $rule): JsonResponse
    {
        $model = CommissionRuleModel::query()->findOrFail($rule);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);
        $model->delete();

        return $this->ok(message: __('commission::messages.rule_deleted'));
    }
}
