<?php

declare(strict_types=1);

namespace Modules\Payout\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Admin\Models\AdminModel;
use Modules\Brand\Models\BrandModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Payout\Enums\PayoutDirection;
use Modules\Payout\Enums\PayoutStatus;

/**
 * A settlement record for a brand's accrued commission (Task 65).
 *
 * @property string $id
 * @property PayoutStatus $status
 * @property int $total_amount_minor
 */
#[Fillable(['brand_id', 'currency_code', 'direction', 'status', 'total_amount_minor', 'period_started_at', 'period_ended_at', 'approved_by_id', 'approved_at', 'paid_at', 'external_reference', 'notes'])]
#[Table('payouts')]
class PayoutModel extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'direction' => PayoutDirection::class,
            'status' => PayoutStatus::class,
            'total_amount_minor' => 'integer',
            'period_started_at' => 'datetime',
            'period_ended_at' => 'datetime',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<BrandModel, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }

    /** @return BelongsTo<CurrencyModel, $this> */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_code', 'code');
    }

    /** @return BelongsTo<AdminModel, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(AdminModel::class, 'approved_by_id');
    }

    /** @return HasMany<CommissionEntryModel, $this> */
    public function entries(): HasMany
    {
        return $this->hasMany(CommissionEntryModel::class, 'payout_id');
    }
}
