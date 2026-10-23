<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use LogicException;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\BranchLifecycleConflictException;
use Modules\Dashboard\Handlers\Branches\UpdateBranchHandler;
use Modules\Dashboard\Http\Requests\UpdateBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBranchAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures, private readonly UpdateBranchHandler $handler) {}

    public function __invoke(UpdateBranchRequest $request, BranchModel $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $branchId = $branch->getAttribute('id');
        if (! is_string($branchId) && ! is_int($branchId)) {
            throw new LogicException('Branch identifier must be scalar.');
        }
        $branchId = (string) $branchId;
        $this->brandFeatures->ensureBranchManageable($branchId);
        if (! $actor->isPlatformAdmin() && (! $actor->canAccessBranch($branchId) || ! $this->keepsBrandInScope($actor, $branch, $request->validated('brand_id')))) {
            return $this->forbidden();
        }

        try {
            $updatedBranch = $this->handler->handle($branch, new UpdateBranchCommand($branchId, $request->validated()));
        } catch (BranchLifecycleConflictException) {
            return $this->error(ErrorCodeEnum::CONFLICT, __('dashboard::messages.branch_last_active'), 409);
        }

        return $this->updated($updatedBranch);
    }

    /**
     * A branch manager cannot move their branch to another brand, and a brand
     * owner can move it only between brands they own.
     */
    private function keepsBrandInScope(DashboardActor $actor, BranchModel $branch, mixed $brandId): bool
    {
        if ($actor->isBrandOwner()) {
            return $actor->canManageBrand($brandId);
        }

        return (string) $branch->getAttribute('brand_id') === (string) $brandId;
    }
}
