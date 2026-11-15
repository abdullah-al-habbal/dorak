<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BranchLifecycle;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Services\BranchLifecycleService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

/** D9: the owner (or a platform admin) switches a branch on or off; branch managers are refused by the route middleware. The route default `on` picks the direction. */
final class SwitchBranchAction extends BaseApiAction
{
    public function __construct(private readonly BranchLifecycleService $lifecycle, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(Request $request, string $branch, bool $on): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        // Out-of-scope branches are indistinguishable from missing ones.
        abort_unless($actor->canAccessBranch($branch), 404);

        Gate::forUser($actor)->authorize('dashboard.branchLifecycle.switch', $branch);
        $this->writeGuard->ensureBranchIdWritable($actor, $branch);

        $updated = $on ? $this->lifecycle->switchOn($actor, $branch) : $this->lifecycle->switchOff($actor, $branch);

        return $this->ok(data: $updated, message: __($on ? 'branch::messages.switched_on' : 'branch::messages.switched_off'));
    }
}
