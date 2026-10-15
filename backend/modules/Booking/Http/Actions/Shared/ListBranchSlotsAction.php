<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Eloquent\Resolvers\Shared\NonDiscoverableBookingEntityException;
use Modules\Booking\Handlers\Shared\ListSlotsHandler;
use Modules\Booking\Http\Requests\Shared\ListBranchSlotsRequest;
use Modules\Booking\Http\Resources\Shared\SlotResource;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListBranchSlotsAction extends BaseApiAction
{
    public function __construct(
        private readonly ListSlotsHandler $handler,
    ) {}

    public function __invoke(ListBranchSlotsRequest $request, string $branch): JsonResponse
    {
        BranchModel::query()->discoverable()->findOrFail($branch);

        try {
            $slots = $this->handler->handle($request->toQuery($branch));
        } catch (InvalidBookingServicesException) {
            return $this->unprocessable(message: __('booking::messages.invalid_booking_services'));
        } catch (NonDiscoverableBookingEntityException) {
            return $this->unprocessable(message: __('booking::messages.entity_not_discoverable'));
        }

        return $this->ok(SlotResource::collection($slots));
    }
}
