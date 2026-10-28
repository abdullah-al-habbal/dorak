<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Commission\Http\Requests\Admin\ListCommissionRequest;
use Modules\Commission\Http\Resources\Admin\CommissionRuleResource;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListCommissionRulesAction extends BaseApiAction
{
    public function __invoke(ListCommissionRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', CommissionRuleModel::class);

        $rules = CommissionRuleModel::query()->with('currency')->latest()->paginate($request->perPage());

        return $this->paginated($rules, CommissionRuleResource::class);
    }
}
