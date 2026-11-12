<?php

// modules/Chair/Models/ChairModel.php
declare(strict_types=1);

namespace Modules\Chair\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;

/**
 * @property string $branch_id
 * @property string|null $barber_id
 */
#[Fillable(['branch_id', 'barber_id', 'label', 'floor_zone', 'layout_settings', 'status'])]
#[Table('chairs')]
class ChairModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'status' => ChairStatus::class,
            'floor_zone' => FloorZone::class,
            'layout_settings' => 'array',
        ];
    }

    /** @return BelongsTo<BranchModel, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }

    /** @return BelongsTo<BarberModel, $this> */
    public function barber(): BelongsTo
    {
        return $this->belongsTo(BarberModel::class, 'barber_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(BookingModel::class, 'chair_id');
    }

    /**
     * Chairs of a branch guests may discover (enabled, active brand, not banned).
     *
     * @param  Builder<ChairModel>  $query
     * @return Builder<ChairModel>
     */
    public function scopeDiscoverable(Builder $query): Builder
    {
        return $query->whereHas('branch', fn (Builder $branch) => $branch->discoverable());
    }

    /** Public payloads never expose a seated barber who is not enabled or is banned. */
    public function concealUndiscoverableBarber(): static
    {
        $barber = $this->barber;

        if ($barber !== null && (! $barber->isEnabled || $barber->isBanned())) {
            $this->setRelation('barber', null);
        }

        return $this;
    }

    public function currentAvailability(): ChairStatus
    {
        $status = $this->getAttribute('status');

        if (! $status instanceof ChairStatus) {
            return ChairStatus::Maintenance;
        }

        if ($status !== ChairStatus::Available) {
            return $status;
        }

        return $this->relationLoaded('bookings') && $this->bookings->isNotEmpty()
            ? ChairStatus::Occupied
            : ChairStatus::Available;
    }
}
