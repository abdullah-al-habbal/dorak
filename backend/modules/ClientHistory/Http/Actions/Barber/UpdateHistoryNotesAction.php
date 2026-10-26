<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\ClientHistory\Handlers\UpdateClientHistoryHandler;
use Modules\ClientHistory\Http\Requests\Barber\UpdateHistoryNotesRequest;
use Modules\ClientHistory\Http\Resources\Client\ClientServiceHistoryResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateHistoryNotesAction extends BaseApiAction
{
    public function __construct(
        private readonly UpdateClientHistoryHandler $handler,
    ) {}

    public function __invoke(UpdateHistoryNotesRequest $request, string $history): JsonResponse
    {
        $updated = $this->handler->handle($request->toCommand($history));

        return $this->ok(data: new ClientServiceHistoryResource($updated));
    }
}
