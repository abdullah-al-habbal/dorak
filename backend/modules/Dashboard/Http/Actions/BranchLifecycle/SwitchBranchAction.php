<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BranchLifecycle;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Services\BranchLifecycleService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

/** D9: the owner (or a manager of that branch) switches a branch on or off; the route default `on` picks the direction. */
final class SwitchBranchAction extends BaseApiAction
{
    public function __construct(private readonly BranchLifecycleService $lifecycle) {}

    public function __invoke(Request $request, string $branch, bool $on): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        // Out-of-scope branches are indistinguishable from missing ones.
        abort_unless($actor->canAccessBranch($branch), 404);

        $updated = $on ? $this->lifecycle->switchOn($actor, $branch) : $this->lifecycle->switchOff($actor, $branch);

        return $this->ok(data: $updated, message: __($on ? 'branch::messages.switched_on' : 'branch::messages.switched_off'));
    }
}
