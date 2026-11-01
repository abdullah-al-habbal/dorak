<?php

// modules/Preference/Models/PreferenceModel.php
declare(strict_types=1);

namespace Modules\Preference\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\Core\Enums\Locale;
use Modules\Currency\Models\CurrencyModel;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Enums\PriceDisplayModeEnum;
use Modules\Preference\Enums\ThemeEnum;

#[Fillable([
    'preferenceable_id',
    'preferenceable_type',
    'preferred_language',
    'is_notification_enabled',
    'display_currency_code',
    'theme',
    'price_display_mode',
    'is_dual_price_display_enabled',
])]
#[Table('preferences')]
class PreferenceModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'preferenceable_type' => PreferenceableTypeEnum::class,
            'preferred_language' => Locale::class,
            'is_notification_enabled' => 'boolean',
            'theme' => ThemeEnum::class,
            'price_display_mode' => PriceDisplayModeEnum::class,
            'is_dual_price_display_enabled' => 'boolean',
        ];
    }

    public function preferenceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function displayCurrency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'display_currency_code', 'code');
    }
}
