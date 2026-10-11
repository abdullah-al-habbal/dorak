<?php

declare(strict_types=1);

namespace Modules\Chair\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Chair\Handlers\Client\UpdateChairHandler;
use Modules\Chair\Http\Requests\Client\UpdateChairRequest;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateChairAction extends BaseApiAction
{
    public function __construct(
        private readonly UpdateChairHandler $handler,
    ) {}

    public function __invoke(UpdateChairRequest $request, ChairModel $chair): JsonResponse
    {
        Gate::forUser($request->user())->authorize('update', $chair);
        $chair = $this->handler->handle($request->toCommand($chair->getKey()));

        return $this->updated(data: new ChairResource($chair));
    }
}
