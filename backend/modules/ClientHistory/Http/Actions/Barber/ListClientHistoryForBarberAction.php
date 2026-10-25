<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\ClientHistory\Handlers\ListClientServiceHistoryHandler;
use Modules\ClientHistory\Http\Requests\Barber\ListClientHistoryForBarberRequest;
use Modules\ClientHistory\Http\Resources\ClientServiceHistoryResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListClientHistoryForBarberAction extends BaseApiAction
{
    public function __construct(
        private readonly ListClientServiceHistoryHandler $handler,
    ) {}

    public function __invoke(ListClientHistoryForBarberRequest $request): JsonResponse
    {
        $histories = $this->handler->handle($request->toQuery());

        return $this->paginated(
            paginator: $histories,
            resourceClass: ClientServiceHistoryResource::class,
        );
    }
}
