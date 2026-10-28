<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Http\Requests\Admin\ListPaginatedRequest;
use Modules\Subscription\Http\Resources\Admin\SubscriptionPlanResource;
use Modules\Subscription\Models\SubscriptionPlanModel;

final class ListSubscriptionPlansAction extends BaseApiAction
{
    public function __invoke(ListPaginatedRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', SubscriptionPlanModel::class);

        $plans = SubscriptionPlanModel::query()
            ->with(['currency', 'features'])
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->paginate($request->perPage());

        return $this->paginated($plans, SubscriptionPlanResource::class);
    }
}
