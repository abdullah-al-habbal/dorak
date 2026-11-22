<?php

// modules/Brand/Models/BrandModel.php
declare(strict_types=1);

namespace Modules\Brand\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Support\UniqueSlug;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Preference\Models\PreferenceModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['owner_id', 'name', 'slug', 'universe', 'description', 'logo_url', 'base_currency_code', 'status', 'status_reason', 'submission_count'])]
#[Table('brands')]
#[Translatable([
    'name',
    'description',
])]
class BrandModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    /** Every brand gets a unique slug from `name.en`, suffixed `-2`, `-3`… on clashes (Task 49). */
    protected static function booted(): void
    {
        static::creating(function (BrandModel $brand): void {
            if (is_string($brand->getAttribute('slug')) && $brand->getAttribute('slug') !== '') {
                return;
            }

            $brand->setAttribute('slug', UniqueSlug::make(
                (string) $brand->getTranslation('name', 'en', false),
                'brand',
                fn (string $slug): bool => self::query()->where('slug', $slug)->exists(),
            ));
        });

        static::deleting(function (BrandModel $brand): void {
            $branchIds = $brand->branches()->pluck('id');

            BarberAffiliationModel::query()
                ->whereIn('status', [AffiliationStatus::Pending, AffiliationStatus::Active])
                ->where(function ($query) use ($brand, $branchIds): void {
                    $query->where(function ($brandQuery) use ($brand): void {
                        $brandQuery->where('affiliable_type', AffiliableType::Brand)->where('affiliable_id', $brand->id);
                    })->orWhere(function ($branchQuery) use ($branchIds): void {
                        $branchQuery->where('affiliable_type', AffiliableType::Branch)->whereIn('affiliable_id', $branchIds);
                    });
                })
                ->update(['status' => AffiliationStatus::Terminated, 'terminated_at' => now()]);
        });
    }

    protected function casts(): array
    {
        return [
            'universe' => VenueUniverse::class,
            'status' => BrandStatusEnum::class,
            'submission_count' => 'integer',
            'description' => 'array',
            'name' => 'array',
        ];
    }

    public function isActive(): bool
    {
        return $this->getAttribute('status') === BrandStatusEnum::Active;
    }

    /**
     * @param  Builder<BrandModel>  $query
     * @return Builder<BrandModel>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', BrandStatusEnum::Active->value);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(ClientModel::class, 'owner_id');
    }

    public function baseCurrency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'base_currency_code', 'code');
    }

    /** @return HasMany<BranchModel, $this> */
    public function branches(): HasMany
    {
        return $this->hasMany(BranchModel::class, 'brand_id');
    }

    public function affiliations(): MorphMany
    {
        return $this->morphMany(BarberAffiliationModel::class, 'affiliable');
    }

    public function services(): MorphMany
    {
        return $this->morphMany(OfferedServiceModel::class, 'serviceable');
    }

    public function preference(): MorphOne
    {
        return $this->morphOne(PreferenceModel::class, 'preferenceable');
    }
}
