<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Activation\Http\Resources\Business\ActivationLogResource;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Services\BranchLifecycleService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class ActivateBranchAction extends BaseApiAction
{
    public function __construct(
        private readonly ToggleActivationHandler $handler,
        private readonly BranchLifecycleService $lifecycle,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $branch): JsonResponse
    {
        /** @var AdminModel $admin */
        $admin = $request->user('admin_api');
        // The lifecycle rules apply here too: a suspended branch stays suspended (409), and the plan limit and last-active rule hold.
        $this->lifecycle->switchOn(DashboardActor::platformAdmin((string) $admin->getKey()), $branch);

        $log = $this->handler->handle(
            $request->toActivateCommand($branch, ActivableTypeEnum::Branch, (string) $admin->getKey()),
        );

        return $this->created(
            data: new ActivationLogResource($log),
            message: __('activation::messages.branch_activated'),
        );
    }
}
