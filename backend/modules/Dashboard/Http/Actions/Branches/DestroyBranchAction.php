<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use LogicException;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyBranchCommand;
use Modules\Dashboard\Eloquent\Resolvers\Branches\BranchLifecycleConflictException;
use Modules\Dashboard\Handlers\Branches\DestroyBranchHandler;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class DestroyBranchAction extends BaseApiAction
{
    public function __construct(private readonly DestroyBranchHandler $handler, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(Request $request, BranchModel $branch): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.branch.delete', $branch);
        $this->writeGuard->ensureBranchWritable($actor, $branch);

        try {
            $branchId = $branch->getAttribute('id');
            if (! is_string($branchId) && ! is_int($branchId)) {
                throw new LogicException('Branch identifier must be scalar.');
            }
            $this->handler->handle($branch, new DestroyBranchCommand((string) $branchId));
        } catch (BranchLifecycleConflictException $exception) {
            $message = $exception->reason === 'last_branch'
                ? __('dashboard::messages.branch_last_active')
                : __('dashboard::messages.branch_has_upcoming_bookings');

            return $this->error(ErrorCodeEnum::CONFLICT, $message, 409);
        }

        return $this->deleted();
    }
}
