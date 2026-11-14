<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Services\BrandApprovalGuard;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreBranchCommand;
use Modules\Dashboard\Handlers\Branches\StoreBranchHandler;
use Modules\Dashboard\Http\Requests\Business\StoreBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

final class StoreBranchAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly BrandApprovalGuard $approvals,
        private readonly StoreBranchHandler $handler) {}

    public function __invoke(StoreBranchRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.branch.create', $request->validated('brand_id'));
        $this->approvals->ensureCanAddBranch($actor, $request->validated('brand_id'));
        $this->brandFeatures->ensureCanAddBranch($request->validated('brand_id'));

        return $this->created($this->handler->handle(new StoreBranchCommand($request->validated())));
    }
}
