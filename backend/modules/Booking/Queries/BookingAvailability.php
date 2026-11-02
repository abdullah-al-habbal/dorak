<?php

declare(strict_types=1);

namespace Modules\Booking\Queries;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Modules\Booking\Enums\BookingStatus;

final class BookingAvailability
{
    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public static function apply(Builder $query, Carbon $startsAt, Carbon $endsAt): Builder
    {
        return $query->whereIn('booking_status', BookingStatus::reservationBlockingValues())
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);
    }
}
