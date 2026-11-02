<?php

declare(strict_types=1);

namespace Modules\Chair\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Chair\Exceptions\ChairHasActiveBookingsException;
use Modules\Chair\Handlers\Client\UpdateChairHandler;
use Modules\Chair\Http\Requests\Client\UpdateChairRequest;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateChairAction extends BaseApiAction
{
    public function __construct(
        private readonly UpdateChairHandler $handler,
    ) {}

    public function __invoke(UpdateChairRequest $request, ChairModel $chair): JsonResponse
    {
        Gate::forUser($request->user())->authorize('update', $chair);

        try {
            $result = $this->handler->handle($request->toCommand($chair->getKey()));
        } catch (ChairHasActiveBookingsException $conflict) {
            return $this->error(
                'CHAIR_HAS_ACTIVE_BOOKINGS',
                __('dashboard::messages.chair_has_active_bookings'),
                409,
                ['booking_ids' => $conflict->bookingIds],
            );
        }

        return $this->updated(data: new ChairResource($result->chair), meta: ['cancelled_booking_ids' => $result->cancelledBookingIds]);
    }
}
