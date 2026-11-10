<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BranchLifecycle;

use Illuminate\Http\JsonResponse;
use Modules\Branch\Services\BranchLifecycleService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\SuspendBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

/** D9: only a platform admin suspends a branch, with a reason. */
final class SuspendBranchAction extends BaseApiAction
{
    public function __construct(private readonly BranchLifecycleService $lifecycle) {}

    public function __invoke(SuspendBranchRequest $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        return $this->ok(data: $this->lifecycle->suspend($actor, $branch, $request->reason()), message: __('branch::messages.suspended'));
    }
}
