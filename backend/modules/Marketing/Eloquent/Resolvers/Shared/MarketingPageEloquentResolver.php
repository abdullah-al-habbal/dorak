<?php

declare(strict_types=1);

namespace Modules\Marketing\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Collection;
use Modules\Marketing\Models\MarketingPageModel;

final class MarketingPageEloquentResolver
{
    public function findBySlug(string $slug): ?MarketingPageModel
    {
        /** @var MarketingPageModel|null */
        return MarketingPageModel::query()->where('slug', $slug)->first();
    }

    /** The only lookup the public site and the public API use: a draft page does not exist for them. */
    public function findPublishedBySlug(string $slug): ?MarketingPageModel
    {
        /** @var MarketingPageModel|null */
        return MarketingPageModel::query()->published()->where('slug', $slug)->first();
    }

    /** @return Collection<int, MarketingPageModel> */
    public function listPublished(): Collection
    {
        return MarketingPageModel::query()->published()->orderBy('slug')->get();
    }

    public function findBySlugWithSections(string $slug): ?MarketingPageModel
    {
        /** @var MarketingPageModel|null */
        return MarketingPageModel::query()
            ->with('sections')
            ->where('slug', $slug)
            ->first();
    }

    public function findBySlugWithAll(string $slug): ?MarketingPageModel
    {
        /** @var MarketingPageModel|null */
        return MarketingPageModel::query()
            ->with(['sections.testimonials'])
            ->where('slug', $slug)
            ->first();
    }
}
