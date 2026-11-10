<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Handlers\Client\UpdateBrandHandler;
use Modules\Brand\Http\Requests\Client\UpdateBrandRequest;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBrandAction extends BaseApiAction
{
    public function __construct(private readonly UpdateBrandHandler $handler, private readonly BrandApprovalGuard $approvals) {}

    public function __invoke(UpdateBrandRequest $request, string $brand): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        abort_unless($actor->canManageBrand($brand), 404);

        $this->approvals->ensureNotSuspended($actor, $brand);

        $model = $this->handler->handle($request->toCommand($brand));

        return $this->updated(new BrandResource($model->loadCount('branches')));
    }
}
