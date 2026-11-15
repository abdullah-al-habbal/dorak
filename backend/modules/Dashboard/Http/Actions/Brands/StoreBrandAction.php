<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Handlers\Client\CreateBrandHandler;
use Modules\Brand\Http\Requests\Client\CreateBrandRequest;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class StoreBrandAction extends BaseApiAction
{
    public function __construct(private readonly CreateBrandHandler $handler) {}

    public function __invoke(CreateBrandRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        // A brand is owned by a client account (ADR 0001), so only an owner creates one here.
        Gate::forUser($actor)->authorize('dashboard.brand.create');

        $brand = $this->handler->handle($request->toCommand($actor->id));

        return $this->created(new BrandResource($brand->loadCount('branches')));
    }
}
