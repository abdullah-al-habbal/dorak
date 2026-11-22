<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use Modules\Explore\Constants\ExploreSearchConstants;

final class ExploreTextSearch
{
    public function pattern(string $term): string
    {
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(trim($term)));

        return '%'.$escaped.'%';
    }

    public function orMatchTranslatable(Builder|QueryBuilder $query, array $columns, string $pattern): void
    {
        $grammar = $query instanceof Builder ? $query->getQuery()->getGrammar() : $query->getGrammar();

        foreach ($columns as $column) {
            foreach (ExploreSearchConstants::EXPLORE_SEARCH_TEXT_LOCALES as $locale) {
                $query->orWhereRaw('lower('.$grammar->wrap("{$column}->{$locale}").") like ? escape '!'", [$pattern]);
            }
        }
    }

    /** Matches the text of a list of `{en, ar}` tags (the values only, never the `en` and `ar` keys). */
    public function orMatchJsonList(Builder|QueryBuilder $query, string $column, string $pattern): void
    {
        $grammar = $query instanceof Builder ? $query->getQuery()->getGrammar() : $query->getGrammar();

        $query->orWhereRaw('json_search(lower('.$grammar->wrap($column).'), \'one\', ?, \'!\', \'$[*].*\') is not null', [$pattern]);
    }

    public function tagExists(QueryBuilder $query, ?string $pattern, ?array $tagIds): void
    {
        $query->select(DB::raw(1))
            ->from('service_catalog_item_tag_assignments')
            ->join('service_catalog_item_tags', 'service_catalog_item_tags.id', '=', 'service_catalog_item_tag_assignments.tag_id')
            ->whereColumn('service_catalog_item_tag_assignments.item_id', 'service_catalog_items.id')
            ->where('service_catalog_item_tags.is_active', true)
            ->whereNull('service_catalog_item_tags.deleted_at')
            ->when($tagIds !== null, fn (QueryBuilder $tags) => $tags->whereIn('service_catalog_item_tags.id', $tagIds ?? []))
            ->when($pattern !== null, fn (QueryBuilder $tags) => $tags->where(fn (QueryBuilder $names) => $this->orMatchTranslatable($names, ['service_catalog_item_tags.name'], $pattern ?? '')));
    }
}
