<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\OfferedService\CQRS\Command\Barber\StoreBarberServiceCommand;
use Modules\OfferedService\Handlers\Barber\StoreBarberServiceHandler;
use Modules\OfferedService\Http\Requests\Barber\BarberServiceRequest;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class StoreBarberServiceAction extends BaseApiAction
{
    public function __construct(private readonly StoreBarberServiceHandler $handler) {}

    public function __invoke(BarberServiceRequest $request): JsonResponse
    {
        $service = $this->handler->handle(new StoreBarberServiceCommand(
            (string) $request->user()->id,
            $request->validated(),
        ));

        return $this->created(ServiceResource::make($service));
    }
}
