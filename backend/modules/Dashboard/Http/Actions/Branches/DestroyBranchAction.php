<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyBranchCommand;
use Modules\Dashboard\Handlers\Branches\DestroyBranchHandler;
use Modules\Dashboard\Support\DashboardActor;

final class DestroyBranchAction extends BaseApiAction
{
    public function __construct(private readonly DestroyBranchHandler $handler) {}

    public function __invoke(Request $request, BranchModel $branch): JsonResponse
    { /** @var DashboardActor $actor */ $actor = $request->attributes->get('dashboard_actor');
        if (! $actor->isPlatformAdmin() && (! $actor->isBranchManager() || $actor->brandId !== $branch->brand_id)) {
            return $this->forbidden();
        } $this->handler->handle($branch, new DestroyBranchCommand($branch->id));

        return $this->deleted();
    }
}
