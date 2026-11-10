<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BranchLifecycle;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Services\BranchLifecycleService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class ReactivateBranchAction extends BaseApiAction
{
    public function __construct(private readonly BranchLifecycleService $lifecycle) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        return $this->ok(data: $this->lifecycle->reactivate($actor, $branch), message: __('branch::messages.reactivated'));
    }
}
