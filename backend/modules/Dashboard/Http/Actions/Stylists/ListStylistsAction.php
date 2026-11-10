<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListStylistsQuery;
use Modules\Dashboard\Handlers\Stylists\ListStylistsHandler;
use Modules\Dashboard\Http\Requests\Business\ListStylistsRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardStylistResource;
use Modules\Dashboard\Support\DashboardActor;

final class ListStylistsAction extends BaseApiAction
{
    public function __construct(private readonly ListStylistsHandler $handler) {}

    public function __invoke(ListStylistsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $stylists = $this->handler->handle(new ListStylistsQuery(
            $actor->scopedBranchIds(),
            $request->integer('per_page', 15),
            $request->validated('search'),
            $request->validated('chair_id'),
            $request->validated('status'),
            $request->validated('branch_id'),
        ));

        return $this->paginated($stylists, DashboardStylistResource::class);
    }
}
