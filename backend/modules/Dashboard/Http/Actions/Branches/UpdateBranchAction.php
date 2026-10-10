<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateBranchCommand;
use Modules\Dashboard\Handlers\Branches\UpdateBranchHandler;
use Modules\Dashboard\Http\Requests\UpdateBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBranchAction extends BaseApiAction
{
    public function __construct(private readonly UpdateBranchHandler $handler) {}

    public function __invoke(UpdateBranchRequest $request, BranchModel $branch): JsonResponse
    { /** @var DashboardActor $actor */ $actor = $request->attributes->get('dashboard_actor');
        if (! $actor->isPlatformAdmin() && $actor->brandId !== $branch->brand_id) {
            return $this->forbidden();
        }

        return $this->updated($this->handler->handle($branch, new UpdateBranchCommand($branch->id, $request->validated())));
    }
}
