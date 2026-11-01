<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Http\Requests\Branch\ToggleChairStatusRequest;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Events\ChairStatusUpdated;
use Modules\Chair\Exceptions\ChairHasActiveBookingsException;
use Modules\Chair\Models\ChairModel;
use Modules\Chair\Services\ChairStatusService;
use Modules\Core\Enums\SuccessCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class ToggleChairStatusAction extends BaseApiAction
{
    public function __construct(private readonly ChairStatusService $chairStatus) {}

    public function __invoke(ToggleChairStatusRequest $request, string $chair): JsonResponse
    {
        $branch = $request->user('branch_api');
        Gate::forUser($branch)->authorize('manage', $branch);
        $chairModel = ChairModel::where('branch_id', $branch->id)->findOrFail($chair);

        $status = ChairStatus::from($request->validated('status'));

        try {
            $result = $this->chairStatus->update($chairModel, ['status' => $status->value], $request->boolean('force'));
        } catch (ChairHasActiveBookingsException $conflict) {
            return $this->error(
                'CHAIR_HAS_ACTIVE_BOOKINGS',
                __('dashboard::messages.chair_has_active_bookings'),
                409,
                ['booking_ids' => $conflict->bookingIds],
            );
        }

        event(new ChairStatusUpdated(
            chairId: $chairModel->id,
            branchId: $branch->id,
            status: $status->value,
        ));

        return $this->success(
            data: [
                'id' => $chairModel->id,
                'label' => $chairModel->label,
                'status' => $status->value,
            ],
            code: SuccessCodeEnum::UPDATED,
            meta: ['canceled_booking_ids' => $result->canceledBookingIds],
        );
    }
}
