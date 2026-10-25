<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\OfferedService\CQRS\Command\Barber\UpdateBarberServiceCommand;
use Modules\OfferedService\Handlers\Barber\UpdateBarberServiceHandler;
use Modules\OfferedService\Http\Requests\Barber\BarberServiceRequest;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class UpdateBarberServiceAction extends BaseApiAction
{
    public function __construct(private readonly UpdateBarberServiceHandler $handler) {}

    public function __invoke(BarberServiceRequest $request, string $service): JsonResponse
    {
        $updated = $this->handler->handle(new UpdateBarberServiceCommand(
            (string) $request->user()->id,
            $service,
            $request->validated(),
        ));

        return $this->updated(ServiceResource::make($updated));
    }
}
