<?php

// modules/OfferedService/Models/BarberServiceOverrideModel.php
declare(strict_types=1);

namespace Modules\OfferedService\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Brand\Models\BrandModel;

/**
 * A brand's own price and/or duration for a barber-owned service (Gap G6).
 * A null column falls back to the barber's default on the service itself.
 *
 * @property string $id
 * @property string $offered_service_id
 * @property string $brand_id
 * @property int|null $price_amount_minor
 * @property int|null $duration_minutes
 */
#[Fillable([
    'offered_service_id',
    'brand_id',
    'price_amount_minor',
    'duration_minutes',
])]
#[Table('barber_service_overrides')]
class BarberServiceOverrideModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'price_amount_minor' => 'integer',
            'duration_minutes' => 'integer',
        ];
    }

    /** @return BelongsTo<OfferedServiceModel, $this> */
    public function offeredService(): BelongsTo
    {
        return $this->belongsTo(OfferedServiceModel::class, 'offered_service_id');
    }

    /** @return BelongsTo<BrandModel, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }
}
