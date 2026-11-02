<?php

// modules/Booking/Models/BookingModel.php
declare(strict_types=1);

namespace Modules\Booking\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Review\Models\ReviewModel;

/**
 * @property string $client_id
 * @property string|null $barber_id
 * @property string|null $chair_id
 * @property string|null $branch_id
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 * @property BookingStatus $booking_status
 */
#[Fillable(['client_id', 'chair_id', 'branch_id', 'barber_id', 'starts_at', 'ends_at', 'booking_status', 'cancellation_reason', 'payment_method', 'payment_status', 'home_address'])]
#[Table('bookings')]
class BookingModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'booking_status' => BookingStatus::class,
            'payment_method' => BookingPaymentMethod::class,
            'payment_status' => BookingPaymentStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'home_address' => 'array',
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

    /** @return BelongsTo<BranchModel, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }

    /**
     * Bookings that belong to a branch: pinned to it directly (barber-only mode)
     * or through the booked chair.
     *
     * @param  Builder<BookingModel>  $query
     */
    /**
     * Bookings of any of the given branches, matched by `branch_id` or, for
     * legacy rows, through the chair. An empty list matches nothing.
     *
     * @param  list<string>  $branchIds
     */
    public function scopeForBranches(Builder $query, array $branchIds): void
    {
        if ($branchIds === []) {
            $query->whereRaw('0 = 1');

            return;
        }

        $query->where(function (Builder $scoped) use ($branchIds): void {
            $scoped->whereIn('branch_id', $branchIds)
                ->orWhereHas('chair', fn (Builder $chair) => $chair->whereIn('branch_id', $branchIds));
        });
    }

    public function scopeForBranch(Builder $query, string|int|null $branchId): void
    {
        if ($branchId === null) {
            $query->whereRaw('0 = 1');

            return;
        }

        $query->where(function (Builder $scoped) use ($branchId): void {
            $scoped->where('branch_id', $branchId)
                ->orWhereHas('chair', fn (Builder $chair) => $chair->where('branch_id', $branchId));
        });
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

    /** Every review written about this booking, by either side and for any subject. */
    public function reviews(): HasMany
    {
        return $this->hasMany(ReviewModel::class, 'booking_id');
    }
}
