<?php

// modules/Chair/Models/ChairModel.php
declare(strict_types=1);

namespace Modules\Chair\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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

#[Fillable(['branch_id', 'barber_id', 'label', 'floor_zone', 'ui_metadata', 'status'])]
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
            'ui_metadata' => 'array',
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
