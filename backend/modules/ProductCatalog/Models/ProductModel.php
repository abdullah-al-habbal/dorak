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
use Modules\Brand\Models\BrandModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

/**
 * A brand-owned product definition. Price, publication and stock live on the branch listing.
 *
 * @property string $id
 * @property string $brand_id
 * @property bool $is_active
 */
#[Fillable(['brand_id', 'name', 'description', 'category', 'metadata', 'is_active'])]
#[Table('products')]
#[Translatable(['name', 'description'])]
class ProductModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<BrandModel, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }

    /** @return HasMany<ProductMediumModel, $this> */
    public function media(): HasMany
    {
        return $this->hasMany(ProductMediumModel::class, 'product_id')->orderBy('sort_order');
    }

    /** @return HasMany<BranchProductModel, $this> */
    public function listings(): HasMany
    {
        return $this->hasMany(BranchProductModel::class, 'product_id');
    }
}
