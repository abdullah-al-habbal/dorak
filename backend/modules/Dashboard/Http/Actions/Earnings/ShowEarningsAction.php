<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Earnings;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowEarningsQuery;
use Modules\Dashboard\Handlers\Earnings\ShowEarningsHandler;
use Modules\Dashboard\Http\Requests\Business\ShowEarningsRequest;
use Modules\Dashboard\Support\DashboardActor;

/** Role-scoped earnings: owner = their brands, manager = their branch, stylist = personal bookings (Gap G4). */
final class ShowEarningsAction extends BaseApiAction
{
    public function __construct(private readonly ShowEarningsHandler $handler) {}

    public function __invoke(ShowEarningsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        return $this->success($this->handler->handle(new ShowEarningsQuery(
            $actor->actorType,
            $actor->id,
            $actor->scopedBranchIds() ?? [],
            $request->from(),
            $request->to(),
        )));
    }
}
