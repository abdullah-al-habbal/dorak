<?php

declare(strict_types=1);

namespace Modules\Chair\Services;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Exceptions\ChairHasActiveBookingsException;
use Modules\Chair\Models\ChairModel;
use Modules\Chair\ValuesObjects\ChairStatusChangeResult;

/**
 * Single code path for moving a chair into maintenance (rule E5 / EC-2):
 * reject while reservation-blocking bookings remain, or, when forced, cancel
 * them through the booking lifecycle and notify each client.
 */
final class ChairStatusService
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    /** @param array<string, mixed> $attributes */
    public function update(ChairModel $chair, array $attributes, bool $force): ChairStatusChangeResult
    {
        $enteringMaintenance = ($attributes['status'] ?? null) === ChairStatus::Maintenance->value;

        /** @var list<BookingModel> $cancelled */
        $cancelled = [];
        $updated = DB::transaction(function () use ($chair, $attributes, $force, $enteringMaintenance, &$cancelled): ChairModel {
            $locked = ChairModel::query()->lockForUpdate()->findOrFail($chair->id);

            if ($enteringMaintenance) {
                $affected = BookingModel::query()
                    ->where('chair_id', $locked->id)
                    ->whereIn('booking_status', BookingStatus::reservationBlockingValues())
                    ->where('ends_at', '>', now())
                    ->orderBy('starts_at')
                    ->lockForUpdate()
                    ->get();

                if ($affected->isNotEmpty() && ! $force) {
                    throw new ChairHasActiveBookingsException(array_map(fn (BookingModel $booking): string => (string) $booking->id, array_values($affected->all())));
                }

                foreach ($affected as $booking) {
                    $cancelled[] = $this->lifecycle->cancelForChairMaintenance($booking->id);
                }
            }

            $locked->update($attributes);

            return $locked->refresh()->load('barber');
        });

        return new ChairStatusChangeResult($updated, array_map(fn (BookingModel $booking): string => (string) $booking->id, $cancelled));
    }
}
