<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListStylistsQuery;
use Modules\Dashboard\Handlers\Stylists\ListStylistsHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ListStylistsAction extends BaseApiAction
{
    public function __construct(private readonly ListStylistsHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $stylists = $this->handler->handle(new ListStylistsQuery(
            $actor->scopedBranchIds(),
            $request->integer('per_page', 15),
        ));

        return $this->paginated($stylists, BarberResource::class);
    }
}
