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
use Modules\OfferedService\Enums\ServiceableTypeEnum;
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
    'currency_code',
    'duration',
    'is_at_home',
    'is_active',
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

    /** @var list<string> */
    protected $with = ['currency'];

    protected function casts(): array
    {
        return [
            'serviceable_type' => ServiceableTypeEnum::class,
            'name' => 'array',
            'description' => 'array',
            'price' => 'decimal:2',
            'is_at_home' => 'boolean',
            'is_active' => 'boolean',
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
        return $query->where('is_active', true)
            ->where(fn (Builder $catalog) => $catalog
                ->whereNull('catalog_item_id')
                ->orWhereHas('catalogItem', fn (Builder $item) => $item->where('is_active', true)));
    }

    /**
     * Services owned by a shop: D1, its brand (never the branch itself).
     *
     * @param  Builder<OfferedServiceModel>  $query
     * @return Builder<OfferedServiceModel>
     */
    public function scopeOfferedAtShop(Builder $query, ?string $brandId): Builder
    {
        return $query->where('serviceable_type', ServiceableTypeEnum::Brand)->where('serviceable_id', $brandId);
    }

    public function serviceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_code', 'code');
    }

    /** @return BelongsTo<ServiceCatalogItemModel, $this> */
    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(ServiceCatalogItemModel::class, 'catalog_item_id');
    }
}
