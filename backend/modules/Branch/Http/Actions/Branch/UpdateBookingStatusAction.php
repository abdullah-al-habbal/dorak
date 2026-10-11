<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Http\Requests\Branch\UpdateBookingStatusRequest;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UpdateBookingStatusAction extends BaseApiAction
{
    public function __invoke(UpdateBookingStatusRequest $request, string $booking): JsonResponse
    {
        $branch = $request->user('branch_api');
        if (! $branch instanceof BranchModel) {
            return $this->unauthorized();
        }
        Gate::forUser($branch)->authorize('manage', $branch);
        $model = BookingModel::query()
            ->whereHas('chair', fn ($query) => $query->where('branch_id', $branch->id))
            ->with(['chair', 'barber', 'services'])
            ->findOrFail($booking);
        $value = $request->input('status');
        if (! is_string($value)) {
            return $this->unprocessable(message: __('branch::messages.invalid_booking_status'));
        }
        $status = BookingStatus::from($value);
        if (! in_array($status, [BookingStatus::InProgress, BookingStatus::Completed, BookingStatus::NoShow, BookingStatus::Canceled], true)) {
            return $this->unprocessable(message: __('branch::messages.unsupported_booking_status_transition'));
        }
        $model->update(['status' => $status]);

        return $this->ok(data: BookingResource::make($model->fresh(['chair', 'barber', 'services'])));
    }
}
