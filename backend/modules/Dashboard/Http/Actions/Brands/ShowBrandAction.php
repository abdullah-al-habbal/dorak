<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBrandAction extends BaseApiAction
{
    public function __invoke(Request $request, string $brand): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        // Out-of-scope brands are indistinguishable from missing ones.
        abort_unless($actor->canManageBrand($brand), 404);

        $model = BrandModel::query()->with(['owner', 'baseCurrency'])->withCount('branches')->findOrFail($brand);

        return $this->ok(new BrandResource($model));
    }
}
