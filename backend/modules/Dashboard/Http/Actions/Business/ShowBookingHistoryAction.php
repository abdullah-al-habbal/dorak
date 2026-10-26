<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Business;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\CQRS\Query\Admin\ListStatusChangeLogsQuery;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Handlers\Admin\ListStatusChangeLogsHandler;
use Modules\Audit\Http\Resources\Admin\StatusChangeLogResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Handlers\Bookings\ShowBookingHandler;
use Modules\Dashboard\Support\DashboardActor;

final class ShowBookingHistoryAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowBookingHandler $showHandler,
        private readonly ListStatusChangeLogsHandler $historyHandler,
    ) {}

    public function __invoke(Request $request, string $booking): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowBookingQuery($booking, $actor->scopedBranchIds()));

        $logs = $this->historyHandler->handle(new ListStatusChangeLogsQuery(
            StatusChangeSubjectTypeEnum::Booking,
            (string) $model->id,
            50,
        ));

        return $this->paginated($logs, StatusChangeLogResource::class);
    }
}
