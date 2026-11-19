<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;

/**
 * Append-only ledger of stock changes on a branch listing. Quantities are null when unknown.
 *
 * @property string $id
 * @property string $branch_product_id
 * @property int|null $quantity_before
 * @property int|null $quantity_after
 * @property int $version_after
 */
#[Fillable([
    'branch_product_id',
    'actor_type',
    'actor_id',
    'quantity_before',
    'quantity_after',
    'version_after',
    'reason',
])]
#[Table('stock_adjustments')]
class StockAdjustmentModel extends Model
{
    use HasFactory;
    use HasUuids;

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'actor_type' => StatusChangeActorTypeEnum::class,
            'quantity_before' => 'integer',
            'quantity_after' => 'integer',
            'version_after' => 'integer',
        ];
    }

    /** @return BelongsTo<BranchProductModel, $this> */
    public function branchProduct(): BelongsTo
    {
        return $this->belongsTo(BranchProductModel::class, 'branch_product_id');
    }
}
