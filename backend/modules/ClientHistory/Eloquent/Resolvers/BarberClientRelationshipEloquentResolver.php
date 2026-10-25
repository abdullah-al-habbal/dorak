<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Eloquent\Resolvers;

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;

/**
 * HIST-3: a barber may read a client's history once they share any
 * non-canceled booking (past, active, or upcoming) — direct barber
 * assignment or via the chair the barber was seated at.
 */
final class BarberClientRelationshipEloquentResolver
{
    public function qualifies(string $barberId, string $clientId): bool
    {
        return BookingModel::query()
            ->where('client_id', $clientId)
            ->where('status', '!=', BookingStatus::Canceled->value)
            ->where(fn ($query) => $query
                ->where('barber_id', $barberId)
                ->orWhereHas('chair', fn ($chair) => $chair->where('barber_id', $barberId)))
            ->exists();
    }
}
