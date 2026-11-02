<?php

declare(strict_types=1);

namespace Modules\Marketing\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Marketing\Database\Factories\SectionFactory;
use Modules\Marketing\Enums\SectionTypeEnum;
use Modules\Marketing\Enums\UniverseVisibilityEnum;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable([
    'page_id',
    'section_type',
    'title',
    'subtitle',
    'content',
    'media_url',
    'sort_order',
    'universe_visibility',
])]
#[Table('sections')]
#[Translatable([
    'content',
    'title',
    'subtitle',
])]
final class SectionModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'section_type' => SectionTypeEnum::class,
            'universe_visibility' => UniverseVisibilityEnum::class,
            'content' => 'array',
            'title' => 'array',
            'subtitle' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(MarketingPageModel::class, 'page_id');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(TestimonialModel::class, 'section_id');
    }

    protected static function newFactory(): SectionFactory
    {
        return SectionFactory::new();
    }
}
