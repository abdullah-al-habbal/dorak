<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class ListBrandsAction extends BaseApiAction
{
    private const int DEFAULT_PER_PAGE = 15;

    private const int MAX_PER_PAGE = 100;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBrandIds();
        $search = trim($request->string('search')->toString());
        $perPage = min(max($request->integer('per_page', self::DEFAULT_PER_PAGE), 1), self::MAX_PER_PAGE);

        $brands = BrandModel::query()
            ->with(['owner', 'baseCurrency'])
            ->withCount('branches')
            ->when($scope !== null, fn ($query) => $query->whereKey($scope))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $inner->where('name->en', 'like', $like)->orWhere('name->ar', 'like', $like);
            }))
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginated($brands, BrandResource::class);
    }
}
