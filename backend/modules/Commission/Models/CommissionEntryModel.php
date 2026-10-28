<?php

declare(strict_types=1);

namespace Modules\Commission\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Booking\Models\BookingModel;
use Modules\Brand\Models\BrandModel;
use Modules\Currency\Models\CurrencyModel;

/**
 * The commission accrued by one completed booking (Task 65).
 *
 * @property string $id
 * @property string $brand_id
 * @property string $currency_id
 * @property int $commission_minor
 * @property string|null $payout_id
 */
#[Fillable(['booking_id', 'brand_id', 'branch_id', 'commission_rule_id', 'rule_snapshot', 'base_minor', 'commission_minor', 'currency_id', 'payout_id'])]
#[Table('commission_entries')]
class CommissionEntryModel extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'rule_snapshot' => 'array',
            'base_minor' => 'integer',
            'commission_minor' => 'integer',
        ];
    }

    /** @return BelongsTo<BookingModel, $this> */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(BookingModel::class, 'booking_id');
    }

    /** @return BelongsTo<BrandModel, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }

    /** @return BelongsTo<CurrencyModel, $this> */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_id');
    }
}
