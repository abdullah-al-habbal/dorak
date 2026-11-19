<?php

declare(strict_types=1);

namespace Modules\Booking\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Remembers which booking a client's `Idempotency-Key` created, so a retried request returns that booking instead of
 * a second attempt. `request_hash` fingerprints the request body: the same key with a different body is refused.
 *
 * @property string $id
 * @property string $client_id
 * @property string $booking_id
 * @property string $key
 * @property string $request_hash
 */
#[Fillable(['client_id', 'booking_id', 'key', 'request_hash', 'expires_at'])]
#[Table('booking_idempotency_keys')]
class BookingIdempotencyKeyModel extends Model
{
    use HasUuids;
    use Prunable;

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now());
    }

    /** @return BelongsTo<BookingModel, $this> */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(BookingModel::class, 'booking_id');
    }
}
