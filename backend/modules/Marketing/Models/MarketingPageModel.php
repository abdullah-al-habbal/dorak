<?php

declare(strict_types=1);

namespace Modules\Marketing\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Marketing\Database\Factories\MarketingPageFactory;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['slug', 'title', 'meta_description', 'published_at'])]
#[Table('marketing_pages')]
#[Translatable([
    'title',
    'meta_description',
])]
final class MarketingPageModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'meta_description' => 'array',
            'published_at' => 'datetime',
        ];
    }

    /** Pages the public site and the public API may show: published, and not scheduled for later. */
    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->lte(now());
    }

    public function sections(): HasMany
    {
        return $this->hasMany(SectionModel::class, 'page_id')->orderBy('sort_order');
    }

    protected static function newFactory(): MarketingPageFactory
    {
        return MarketingPageFactory::new();
    }
}
