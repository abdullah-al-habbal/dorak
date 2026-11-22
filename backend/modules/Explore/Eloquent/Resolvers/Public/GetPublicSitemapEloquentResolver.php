<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Public;

use Illuminate\Database\Eloquent\Builder;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Explore\Constants\PublicProfileConstants;

final class GetPublicSitemapEloquentResolver
{
    /**
     * The slugs of every public profile page a search engine may index, using the same visibility rules as the
     * profile endpoints, so a page that answers 404 there is never listed here.
     *
     * @return array{brands: list<array{slug: string, updated_at: ?string}>, branches: list<array{slug: string, updated_at: ?string}>, stylists: list<array{slug: string, updated_at: ?string}>}
     */
    public function resolve(): array
    {
        return [
            'brands' => $this->entries(BrandModel::active()),
            'branches' => $this->entries(BranchModel::discoverable()),
            'stylists' => $this->entries(BarberModel::discoverable()),
        ];
    }

    /**
     * @param  Builder<*>  $query
     * @return list<array{slug: string, updated_at: ?string}>
     */
    private function entries(Builder $query): array
    {
        return $query->whereNotNull('slug')
            ->orderBy('slug')
            ->limit(PublicProfileConstants::EXPLORE_SITEMAP_MAX_PER_KIND)
            ->get(['slug', 'updated_at'])
            ->map(fn ($row): array => [
                'slug' => (string) $row->getAttribute('slug'),
                'updated_at' => $row->getAttribute('updated_at')?->toIso8601String(),
            ])
            ->all();
    }
}
