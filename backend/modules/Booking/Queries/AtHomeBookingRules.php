<?php

declare(strict_types=1);

namespace Modules\Booking\Queries;

use Illuminate\Support\Collection;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Eloquent\Resolvers\Shared\AtHomeBookingRuleException;
use Modules\OfferedService\Models\OfferedServiceModel;

final class AtHomeBookingRules
{
    private const EARTH_RADIUS_KM = 6371.0;

    /**
     * Affiliated barbers may work at home as well (Task 25 decision); schedule and
     * overlap checks run separately on the barber's single calendar.
     *
     * @param  Collection<int, OfferedServiceModel>  $services
     *
     * @throws AtHomeBookingRuleException
     */
    public static function ensure(?string $barberId, Collection $services, float $latitude, float $longitude): void
    {
        if ($barberId === null) {
            throw new AtHomeBookingRuleException('at_home_barber_required');
        }

        foreach ($services as $service) {
            if ($service->getAttribute('at_home') !== true
                || $service->getAttribute('serviceable_type') !== 'barber'
                || $service->getAttribute('serviceable_id') !== $barberId) {
                throw new AtHomeBookingRuleException('at_home_service_not_eligible');
            }
        }

        $barber = BarberModel::query()->findOrFail($barberId);
        $radius = $barber->getAttribute('travel_radius');
        $barberLatitude = $barber->getAttribute('latitude');
        $barberLongitude = $barber->getAttribute('longitude');

        if (! is_numeric($radius) || (float) $radius <= 0 || ! is_numeric($barberLatitude) || ! is_numeric($barberLongitude)) {
            throw new AtHomeBookingRuleException('at_home_not_offered');
        }

        $distance = self::distanceKm((float) $barberLatitude, (float) $barberLongitude, $latitude, $longitude);

        if ($distance > (float) $radius) {
            throw new AtHomeBookingRuleException('at_home_out_of_radius');
        }
    }

    private static function distanceKm(float $fromLat, float $fromLng, float $toLat, float $toLng): float
    {
        $deltaLat = deg2rad($toLat - $fromLat);
        $deltaLng = deg2rad($toLng - $fromLng);
        $a = sin($deltaLat / 2) ** 2
            + cos(deg2rad($fromLat)) * cos(deg2rad($toLat)) * sin($deltaLng / 2) ** 2;

        return self::EARTH_RADIUS_KM * 2 * asin(min(1.0, sqrt($a)));
    }
}
