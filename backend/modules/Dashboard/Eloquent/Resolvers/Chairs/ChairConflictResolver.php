<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;

final class ChairConflictResolver
{
    public function ensureNoBlockingBookings(string $chairId): void
    {
        $blocked = BookingModel::query()->where('chair_id', $chairId)->whereIn('status', BookingStatus::reservationBlockingValues())->where('ends_at', '>', now())->exists();
        if ($blocked) {
            throw new ChairHasActiveBookingsException('Chair has active or future bookings.');
        }
    }
}
