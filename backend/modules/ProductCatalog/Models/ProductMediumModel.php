<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $product_id
 * @property string $image_path
 */
#[Fillable(['product_id', 'image_path', 'alt_text', 'sort_order'])]
#[Table('product_media')]
class ProductMediumModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<ProductModel, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }
}
