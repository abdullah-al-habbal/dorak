<?php

declare(strict_types=1);

namespace Modules\Subscription\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Currency\Models\CurrencyModel;
use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

/**
 * An admin-managed plan: price and billing interval are data, and its feature
 * flags are rows in `plan_features` (Task 65).
 *
 * @property string $id
 * @property int $price_amount_minor
 * @property string $currency_code
 * @property SubscriptionIntervalUnitEnum $interval_unit
 * @property int $interval_count
 */
#[Fillable(['name', 'description', 'price_amount_minor', 'currency_code', 'interval_unit', 'interval_count', 'is_active', 'sort_order'])]
#[Table('subscription_plans')]
#[Translatable(['name', 'description'])]
class SubscriptionPlanModel extends Model
{
    use HasFactory, HasTranslations, HasUuids, SoftDeletes;

    protected function casts(): array
    {
        return [
            'interval_unit' => SubscriptionIntervalUnitEnum::class,
            'price_amount_minor' => 'integer',
            'interval_count' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<CurrencyModel, $this> */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_code', 'code');
    }

    /** @return HasMany<PlanFeatureModel, $this> */
    public function features(): HasMany
    {
        return $this->hasMany(PlanFeatureModel::class, 'plan_id');
    }

    /** @return HasMany<BrandSubscriptionModel, $this> */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(BrandSubscriptionModel::class, 'plan_id');
    }

    /** @return list<string> */
    public function featureKeys(): array
    {
        return $this->features->pluck('feature_key')->values()->all();
    }
}
