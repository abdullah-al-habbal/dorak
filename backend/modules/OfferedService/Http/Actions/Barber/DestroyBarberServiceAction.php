<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\OfferedService\CQRS\Command\Barber\DestroyBarberServiceCommand;
use Modules\OfferedService\Handlers\Barber\DestroyBarberServiceHandler;

final class DestroyBarberServiceAction extends BaseApiAction
{
    public function __construct(private readonly DestroyBarberServiceHandler $handler) {}

    public function __invoke(Request $request, string $service): JsonResponse
    {
        $this->handler->handle(new DestroyBarberServiceCommand(
            (string) $request->user()->id,
            $service,
        ));

        return $this->deleted();
    }
}
