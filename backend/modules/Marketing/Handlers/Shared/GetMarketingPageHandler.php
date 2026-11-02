<?php

declare(strict_types=1);

namespace Modules\Marketing\Handlers\Shared;

use Modules\Marketing\Eloquent\Resolvers\Shared\MarketingPageEloquentResolver;
use Modules\Marketing\Eloquent\Resolvers\Shared\SectionEloquentResolver;
use Modules\Marketing\Enums\SectionTypeEnum;
use Modules\Marketing\Enums\UniverseVisibilityEnum;

final class GetMarketingPageHandler
{
    public function __construct(
        private readonly MarketingPageEloquentResolver $pageResolver,
        private readonly SectionEloquentResolver $sectionResolver,
    ) {}

    public function handle(string $slug, string $locale, UniverseVisibilityEnum $universe): ?array
    {
        $page = $this->pageResolver->findBySlug($slug);

        if ($page === null) {
            return null;
        }

        $sections = $this->sectionResolver->findByPageIdAndUniverse($page->id, $universe);

        return [
            'page' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->getTranslation('title', $locale),
                'meta_description' => $page->getTranslation('meta_description', $locale, false),
            ],
            'sections' => $sections->map(function (mixed $section) use ($locale): array {
                $data = [
                    'id' => $section->id,
                    'section_type' => $section->section_type->value,
                    'sort_order' => $section->sort_order,
                    'universe_visibility' => $section->universe_visibility->value,
                    'body' => $section->getTranslation('body', $locale),
                ];

                if ($section->section_type === SectionTypeEnum::Testimonials) {
                    $section->load('testimonials');
                    $data['testimonials'] = $section->testimonials->map(fn (mixed $t): array => [
                        'id' => $t->id,
                        'author_name' => $t->author_name,
                        'author_title' => $t->author_title,
                        'body' => $t->getTranslation('body', $locale),
                        'rating' => $t->rating,
                    ])->toArray();
                }

                return $data;
            })->toArray(),
        ];
    }
}
