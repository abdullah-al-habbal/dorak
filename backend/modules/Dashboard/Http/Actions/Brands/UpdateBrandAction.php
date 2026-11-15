<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Handlers\Client\UpdateBrandHandler;
use Modules\Brand\Http\Requests\Client\UpdateBrandRequest;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBrandAction extends BaseApiAction
{
    public function __construct(private readonly UpdateBrandHandler $handler, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(UpdateBrandRequest $request, string $brand): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        abort_unless($actor->canManageBrand($brand), 404);

        Gate::forUser($actor)->authorize('dashboard.brand.update', $brand);
        $this->writeGuard->ensureBrandWritable($actor, $brand);

        $model = $this->handler->handle($request->toCommand($brand));

        return $this->updated(new BrandResource($model->loadCount('branches')));
    }
}
