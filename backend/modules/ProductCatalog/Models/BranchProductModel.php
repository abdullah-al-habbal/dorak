<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Branch\Models\BranchModel;
use Modules\Currency\Models\CurrencyModel;

/**
 * A product as sold at one branch: its own price, publication and stock.
 * `stock_quantity` null means unknown, which is not the same as zero. `version` is
 * never mass-assigned; stock writes bump it with a conditional update.
 *
 * @property string $id
 * @property string $product_id
 * @property string $branch_id
 * @property int $price_amount_minor
 * @property string $currency_code
 * @property bool $is_published
 * @property int|null $stock_quantity
 * @property int $version
 */
#[Fillable([
    'product_id',
    'branch_id',
    'price_amount_minor',
    'currency_code',
    'is_published',
    'stock_quantity',
    'stock_confirmed_at',
])]
#[Table('branch_products')]
class BranchProductModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'price_amount_minor' => 'integer',
            'is_published' => 'boolean',
            'stock_quantity' => 'integer',
            'stock_confirmed_at' => 'datetime',
            'version' => 'integer',
        ];
    }

    /** @return BelongsTo<ProductModel, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    /** @return BelongsTo<BranchModel, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }

    /** @return BelongsTo<CurrencyModel, $this> */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_code', 'code');
    }

    /** @return HasMany<StockAdjustmentModel, $this> */
    public function adjustments(): HasMany
    {
        return $this->hasMany(StockAdjustmentModel::class, 'branch_product_id');
    }
}
