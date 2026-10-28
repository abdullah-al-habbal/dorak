<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Http\Requests\Admin\ListPaginatedRequest;
use Modules\Subscription\Http\Resources\Admin\BrandSubscriptionResource;
use Modules\Subscription\Models\BrandSubscriptionModel;

final class ListBrandSubscriptionsAction extends BaseApiAction
{
    public function __invoke(ListPaginatedRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', BrandSubscriptionModel::class);

        $subscriptions = BrandSubscriptionModel::query()
            ->with(['brand', 'plan'])
            ->when($request->query('brand_id'), fn ($query, $brandId) => $query->where('brand_id', $brandId))
            ->latest()
            ->paginate($request->perPage());

        return $this->paginated($subscriptions, BrandSubscriptionResource::class);
    }
}
