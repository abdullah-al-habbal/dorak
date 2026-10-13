<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Branches;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreBranchCommand;
use Modules\Dashboard\Handlers\Branches\StoreBranchHandler;
use Modules\Dashboard\Http\Requests\StoreBranchRequest;
use Modules\Dashboard\Support\DashboardActor;

final class StoreBranchAction extends BaseApiAction
{
    public function __construct(private readonly StoreBranchHandler $handler) {}

    public function __invoke(StoreBranchRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        if (! $actor->isPlatformAdmin()) {
            return $this->forbidden();
        }

        return $this->created($this->handler->handle(new StoreBranchCommand($request->validated())));
    }
}
