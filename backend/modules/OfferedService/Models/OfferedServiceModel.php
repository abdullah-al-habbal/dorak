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
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Constants\ServiceOverrideConstants;
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
    'price_amount_minor',
    'currency_code',
    'duration_minutes',
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
            'price_amount_minor' => 'integer',
            'is_at_home' => 'boolean',
            'is_active' => 'boolean',
            'duration_minutes' => 'integer',
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

    /** @return HasMany<BarberServiceOverrideModel, $this> */
    public function overrides(): HasMany
    {
        return $this->hasMany(BarberServiceOverrideModel::class, 'offered_service_id');
    }

    /**
     * Price in minor units after the brand override set through
     * `EffectiveServiceTerms::attach()`, else the service's own default.
     */
    public function effectivePriceAmountMinor(): int
    {
        return $this->activeOverride()?->price_amount_minor ?? (int) $this->getAttribute('price_amount_minor');
    }

    public function effectiveDurationMinutes(): ?int
    {
        return $this->activeOverride()?->duration_minutes ?? $this->getAttribute('duration_minutes');
    }

    public function hasBrandOverride(): bool
    {
        return $this->activeOverride() !== null;
    }

    public function hasBrandContext(): bool
    {
        return $this->relationLoaded(ServiceOverrideConstants::SERVICE_OVERRIDE_ACTIVE_RELATION);
    }

    private function activeOverride(): ?BarberServiceOverrideModel
    {
        if (! $this->hasBrandContext()) {
            return null;
        }

        $override = $this->getRelation(ServiceOverrideConstants::SERVICE_OVERRIDE_ACTIVE_RELATION);

        return $override instanceof BarberServiceOverrideModel ? $override : null;
    }

    /** @return BelongsTo<ServiceCatalogItemModel, $this> */
    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(ServiceCatalogItemModel::class, 'catalog_item_id');
    }
}
