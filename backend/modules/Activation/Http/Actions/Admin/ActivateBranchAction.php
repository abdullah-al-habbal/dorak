<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Activation\Http\Resources\Business\ActivationLogResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class ActivateBranchAction extends BaseApiAction
{
    public function __construct(
        private readonly ToggleActivationHandler $handler,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $branch): JsonResponse
    {
        $log = $this->handler->handle(
            $request->toActivateCommand($branch, ActivableTypeEnum::Branch),
        );

        return $this->created(
            data: new ActivationLogResource($log),
            message: __('activation::messages.branch_activated'),
        );
    }
}
