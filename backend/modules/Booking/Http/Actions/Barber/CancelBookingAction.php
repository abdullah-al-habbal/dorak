<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingCancellationTooLateException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingNotAssignedException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingTransitionException;
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
            return $this->unauthorized();
        }
        try {
            $result = DB::transaction(function () use ($barber, $booking, $request): BookingModel {
                $record = BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($booking);
                if ($record->barber_id !== $barber->id) {
                    throw new BookingNotAssignedException;
                }
                if ($record->time_slot->lessThanOrEqualTo(now()->addHours(2))) {
                    throw new BookingCancellationTooLateException;
                }
                if (! $record->status->canTransitionTo(BookingStatus::Canceled)) {
                    throw new InvalidBookingTransitionException;
                }
                $record->update(['status' => BookingStatus::Canceled, 'cancellation_reason' => $request->string('cancellation_reason')->toString()]);

                return $record->fresh(['chair']);
            });
        } catch (BookingNotAssignedException) {
            return $this->error(message: __('booking::messages.booking_not_assigned'), status: 403);
        } catch (BookingCancellationTooLateException) {
            return $this->unprocessable(message: __('booking::messages.cancel_too_late'));
        } catch (InvalidBookingTransitionException) {
            return $this->unprocessable(message: __('booking::messages.cancel_invalid_status'));
        }
        event(new BookingCancelledEvent($result->id, (string) $result->chair?->branch_id, $barber->id));

        return $this->ok(new BookingResource($result));
    }
}
