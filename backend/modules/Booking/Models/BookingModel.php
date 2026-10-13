<?php

// modules/Booking/Models/BookingModel.php
declare(strict_types=1);

namespace Modules\Booking\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Review\Models\ReviewModel;

/**
 * @property string $client_id
 * @property string|null $barber_id
 * @property string|null $chair_id
 */
#[Fillable(['client_id', 'chair_id', 'barber_id', 'time_slot', 'ends_at', 'status', 'cancellation_reason', 'payment_method', 'payment_status', 'at_home_location'])]
#[Table('bookings')]
class BookingModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'payment_method' => BookingPaymentMethod::class,
            'payment_status' => BookingPaymentStatus::class,
            'time_slot' => 'datetime',
            'ends_at' => 'datetime',
            'at_home_location' => 'array',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientModel::class, 'client_id');
    }

    /** @return BelongsTo<ChairModel, $this> */
    public function chair(): BelongsTo
    {
        return $this->belongsTo(ChairModel::class, 'chair_id');
    }

    /** @return BelongsTo<BarberModel, $this> */
    public function barber(): BelongsTo
    {
        return $this->belongsTo(BarberModel::class, 'barber_id');
    }

    /** @return BelongsToMany<OfferedServiceModel, $this> */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(OfferedServiceModel::class, 'booking_offered_service', 'booking_id', 'offered_service_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(ReviewModel::class, 'booking_id');
    }
}
