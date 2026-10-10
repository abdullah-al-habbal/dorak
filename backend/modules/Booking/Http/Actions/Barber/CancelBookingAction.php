<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCancelledEvent;
use Modules\Booking\Http\Requests\Barber\CancelBarberBookingRequest;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class CancelBookingAction extends BaseApiAction
{
    public function __invoke(CancelBarberBookingRequest $request, string $booking): JsonResponse
    {
        $barber = Auth::guard('barber')->user();
        if (! $barber instanceof BarberModel) {
            abort(401);
        }
        $result = DB::transaction(function () use ($barber, $booking, $request): BookingModel {
            $record = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($booking);
            if ($record->barber_id !== $barber->id) {
                abort(403);
            }
            if ($record->time_slot->lessThanOrEqualTo(now()->addHours(2)) || ! $record->status->canTransitionTo(BookingStatus::Canceled)) {
                abort(422);
            }
            $record->update(['status' => BookingStatus::Canceled, 'cancellation_reason' => $request->string('cancellation_reason')->toString()]);

            return $record->fresh(['chair']);
        });
        event(new BookingCancelledEvent($result->id, (string) $result->chair?->branch_id, $barber->id));

        return $this->ok(new BookingResource($result));
    }
}
