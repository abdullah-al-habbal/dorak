<?php

declare(strict_types=1);

namespace Modules\OfferedService\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\OfferedService\CQRS\Query\Shared\ListBarberServicesQuery;
use Modules\OfferedService\Handlers\Shared\ListBarberServicesHandler;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class ListOwnBarberServicesAction extends BaseApiAction
{
    public function __construct(private readonly ListBarberServicesHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        $services = $this->handler->handle(new ListBarberServicesQuery(
            barberId: (string) $request->user()->id,
        ));

        return $this->ok(data: ServiceResource::collection($services));
    }
}
