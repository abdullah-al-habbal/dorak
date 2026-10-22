<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\AtHomeBookingRuleException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Handlers\Shared\ListSlotsHandler;
use Modules\Booking\Http\Requests\Shared\ListBarberSlotsRequest;
use Modules\Booking\Http\Resources\Shared\SlotResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListBarberSlotsAction extends BaseApiAction
{
    public function __construct(
        private readonly ListSlotsHandler $handler,
    ) {}

    public function __invoke(ListBarberSlotsRequest $request, string $barber): JsonResponse
    {
        BarberModel::query()->findOrFail($barber);

        try {
            $slots = $this->handler->handle($request->toQuery($barber));
        } catch (AtHomeBookingRuleException $exception) {
            return $this->error(code: $exception->errorCode, message: $exception->getMessage(), status: 422);
        } catch (InvalidBookingServicesException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_services'));
        }

        return $this->ok(SlotResource::collection($slots));
    }
}
