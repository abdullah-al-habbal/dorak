<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Schedule;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Schedule\ListScheduleHoursHandler;
use Modules\Dashboard\Http\Resources\Schedule\ScheduleHoursResource;
use Modules\Dashboard\Support\DashboardActor;

/** The signed-in barber's weekly working hours (read-only; editing stays in the stylist app). */
final class ListScheduleHoursAction extends BaseApiAction
{
    public function __construct(private readonly ListScheduleHoursHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('viewOwn', BarberScheduleModel::class);

        return $this->ok(ScheduleHoursResource::collection($this->handler->handle($actor->id)));
    }
}
