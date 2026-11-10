<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListDashboardBrandsRequest;
use Modules\Dashboard\Support\DashboardActor;

final class ListBrandsAction extends BaseApiAction
{
    public function __invoke(ListDashboardBrandsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('viewAny', BrandModel::class);
        $scope = $actor->scopedBrandIds();
        $search = $request->search();
        $status = $request->status();

        $brands = BrandModel::query()
            ->with(['owner', 'baseCurrency'])
            ->withCount('branches')
            // Only brands whose owner confirmed their email are in the review queue (D12).
            ->whereHas('owner', fn ($owner) => $owner->whereNotNull('email_verified_at'))
            ->when($scope !== null, fn ($query) => $query->whereKey($scope))
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $inner->where('name->en', 'like', $like)->orWhere('name->ar', 'like', $like);
            }))
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($brands, BrandResource::class);
    }
}
