<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Handlers\Branch\CreateManagedBarberHandler;
use Modules\Barber\Http\Requests\Branch\CreateManagedBarberRequest;
use Modules\Barber\Http\Resources\BarberResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class CreateManagedBarberAction extends BaseApiAction
{
    public function __construct(private readonly CreateManagedBarberHandler $handler) {}

    public function __invoke(CreateManagedBarberRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        Gate::forUser($branch)->authorize('manage', $branch);

        return $this->created(data: new BarberResource($this->handler->handle($request->toCommand($branch->getKey()))));
    }
}
