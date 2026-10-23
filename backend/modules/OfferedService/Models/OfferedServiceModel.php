<?php

// modules/OfferedService/Models/OfferedServiceModel.php
declare(strict_types=1);

namespace Modules\OfferedService\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\Currency\Models\CurrencyModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

/**
 * @property string $id
 * @property string|null $catalog_item_id
 */
#[Fillable([
    'serviceable_id',
    'serviceable_type',
    'name',
    'description',
    'price',
    'currency_id',
    'duration',
    'at_home',
    'active',
    'catalog_item_id',
])]
#[Table('offered_services')]
#[Translatable([
    'name',
    'description',
])]
class OfferedServiceModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'price' => 'decimal:2',
            'at_home' => 'boolean',
            'active' => 'boolean',
            'duration' => 'integer',
        ];
    }

    /**
     * Services a client can book: active, and either free-text (CAT-1) or tied
     * to an active catalog item (CAT-2).
     *
     * @param  Builder<OfferedServiceModel>  $query
     * @return Builder<OfferedServiceModel>
     */
    public function scopeBookable(Builder $query): Builder
    {
        return $query->where('active', true)
            ->where(fn (Builder $catalog) => $catalog
                ->whereNull('catalog_item_id')
                ->orWhereHas('catalogItem', fn (Builder $item) => $item->where('is_active', true)));
    }

    /**
     * Services owned by a shop: the branch itself or its brand.
     *
     * @param  Builder<OfferedServiceModel>  $query
     * @return Builder<OfferedServiceModel>
     */
    public function scopeOfferedAtShop(Builder $query, string $branchId, ?string $brandId): Builder
    {
        return $query->where(fn (Builder $owner) => $owner
            ->where(fn (Builder $own) => $own->where('serviceable_type', 'branch')->where('serviceable_id', $branchId))
            ->when($brandId !== null, fn (Builder $either) => $either->orWhere(fn (Builder $brand) => $brand
                ->where('serviceable_type', 'brand')
                ->where('serviceable_id', $brandId))));
    }

    public function serviceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_id');
    }

    /** @return BelongsTo<ServiceCatalogItemModel, $this> */
    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(ServiceCatalogItemModel::class, 'catalog_item_id');
    }
}
