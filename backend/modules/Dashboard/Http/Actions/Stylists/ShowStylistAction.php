<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Barber\Http\Resources\BarberResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Handlers\Stylists\ShowStylistHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowStylistAction extends BaseApiAction
{
    public function __construct(private readonly ShowStylistHandler $handler) {}

    public function __invoke(Request $request, string $stylist): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->handler->handle(new ShowStylistQuery(
            $stylist,
            $actor->isPlatformAdmin() ? null : $actor->branchId,
        ));

        return $this->ok(BarberResource::make($model));
    }
}
