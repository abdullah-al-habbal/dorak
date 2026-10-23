<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

/**
 * Keyword search for discovery (Task 43): a case-insensitive substring match
 * over every locale of translatable JSON columns, plus catalog tag filters.
 *
 * Each locale is read with the grammar's JSON path (`json_unquote(json_extract())`
 * on MySQL, `json_extract()` on SQLite), so Arabic matches on both engines, and
 * `lower()` on both sides keeps it case-insensitive regardless of the JSON
 * collation. `!` escapes LIKE wildcards in the user's text.
 */
final class ExploreTextSearch
{
    /** @var list<string> */
    public const array LOCALES = ['en', 'ar'];

    public function pattern(string $term): string
    {
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(trim($term)));

        return '%'.$escaped.'%';
    }

    /**
     * Adds `(col->en like ? or col->ar like ? ...)` for every column as one OR
     * group to the given query.
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>|QueryBuilder  $query
     * @param  list<string>  $columns
     */
    public function orMatchTranslatable(Builder|QueryBuilder $query, array $columns, string $pattern): void
    {
        $grammar = $query instanceof Builder ? $query->getQuery()->getGrammar() : $query->getGrammar();

        foreach ($columns as $column) {
            foreach (self::LOCALES as $locale) {
                $query->orWhereRaw('lower('.$grammar->wrap("{$column}->{$locale}").") like ? escape '!'", [$pattern]);
            }
        }
    }

    /**
     * Restricts a catalog-item query (aliased to `service_catalog_items`) to
     * items whose tags match the text or are in $tagIds.
     *
     * @param  list<string>|null  $tagIds
     */
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
