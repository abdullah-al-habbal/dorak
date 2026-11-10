<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Brand\Models\BrandModel;
use Throwable;

/** D8: the optional "also cancel future bookings" of a brand suspension. Each client is notified by the booking lifecycle. */
final class BrandSuspensionBookings
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    public function cancelFutureBookings(BrandModel $brand, string $adminId): int
    {
        $cancelled = 0;
        $ids = BookingModel::query()
            ->whereIn('branch_id', $brand->branches()->select('id'))
            ->whereIn('booking_status', BookingStatus::reservationBlockingValues())
            ->where('starts_at', '>', now())
            ->pluck('id');

        foreach ($ids as $id) {
            try {
                $this->lifecycle->transitionForDashboard($id, BookingStatus::Cancelled, StatusChangeActorTypeEnum::Admin, $adminId);
                $cancelled++;
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $cancelled;
    }
}
