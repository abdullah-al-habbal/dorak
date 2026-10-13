<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use LogicException;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\BranchLifecycleConflictException;
use Modules\Dashboard\Handlers\Branches\UpdateBranchHandler;
use Modules\Dashboard\Http\Requests\UpdateBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBranchAction extends BaseApiAction
{
    public function __construct(private readonly UpdateBranchHandler $handler) {}

    public function __invoke(UpdateBranchRequest $request, BranchModel $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $branchId = $branch->getAttribute('id');
        if (! is_string($branchId) && ! is_int($branchId)) {
            throw new LogicException('Branch identifier must be scalar.');
        }
        $branchId = (string) $branchId;
        if (! $actor->isPlatformAdmin() && (! $actor->isBranchManager() || $actor->branchId !== $branchId)) {
            return $this->forbidden();
        }

        try {
            $updatedBranch = $this->handler->handle($branch, new UpdateBranchCommand($branchId, $request->validated()));
        } catch (BranchLifecycleConflictException) {
            return $this->error(ErrorCodeEnum::CONFLICT, __('dashboard::messages.branch_last_active'), 409);
        }

        return $this->updated($updatedBranch);
    }
}
