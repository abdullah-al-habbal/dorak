<?php

declare(strict_types=1);

namespace Modules\Booking\Services;

use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\IdempotencyKeyReusedException;
use Modules\Booking\Models\BookingIdempotencyKeyModel;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;

/**
 * `Idempotency-Key` for creating a booking. Call both methods inside the create transaction. `replay` first takes the
 * client row lock that CreateBookingEloquentResolver also takes, so two retries of one request from one client never
 * run side by side: the second waits, then finds the key the first stored.
 */
final class BookingIdempotency
{
    /** The booking this key already created, or null when the key is new or expired. */
    public function replay(CreateBookingCommand $command): ?BookingModel
    {
        if ($command->idempotencyKey === null) {
            return null;
        }

        ClientModel::query()->lockForUpdate()->findOrFail($command->clientId);

        $stored = BookingIdempotencyKeyModel::query()
            ->where('client_id', $command->clientId)
            ->where('key', $command->idempotencyKey)
            ->first();

        if ($stored === null) {
            return null;
        }

        if ($stored->expires_at->isPast()) {
            $stored->delete();

            return null;
        }

        if (! hash_equals($stored->request_hash, $command->requestHash())) {
            throw new IdempotencyKeyReusedException;
        }

        return $stored->booking()->with(['chair.barber', 'barber', 'services'])->firstOrFail();
    }

    public function remember(CreateBookingCommand $command, BookingModel $booking): void
    {
        if ($command->idempotencyKey === null) {
            return;
        }

        BookingIdempotencyKeyModel::query()->create([
            'client_id' => $command->clientId,
            'booking_id' => $booking->getKey(),
            'key' => $command->idempotencyKey,
            'request_hash' => $command->requestHash(),
            'expires_at' => now()->addHours(BookingConstants::BOOKING_IDEMPOTENCY_TTL_HOURS),
        ]);
    }
}
