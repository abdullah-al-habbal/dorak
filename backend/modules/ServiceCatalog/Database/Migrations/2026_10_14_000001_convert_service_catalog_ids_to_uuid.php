<?php

declare(strict_types=1);

// @contract-migration: Task 14 rekeys the service catalog from auto-increment ids to non-guessable UUIDs; every reference is remapped to the same logical row.
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ForeignIdColumnDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

/*
 * The catalog tables are rebuilt rather than altered in place: the rows are
 * snapshotted, the tables recreated with the new key type, and the rows
 * reinserted with remapped keys. This keeps the migration portable across
 * MySQL and SQLite (which cannot drop a primary key column).
 */
return new class extends Migration
{
    private const CATEGORIES = 'service_catalog_categories';

    private const ITEMS = 'service_catalog_items';

    private const TAGS = 'service_catalog_item_tags';

    private const ASSIGNMENTS = 'service_catalog_item_tag_assignments';

    private const MEDIA = 'service_catalog_media';

    /** Parents before children, so rows can be reinserted in this order. */
    private const CATALOG_TABLES = [self::CATEGORIES, self::ITEMS, self::TAGS, self::ASSIGNMENTS, self::MEDIA];

    /** Catalog columns that point at another catalog table: table => [column => parent]. */
    private const CATALOG_REFERENCES = [
        self::CATEGORIES => ['parent_id' => self::CATEGORIES],
        self::ITEMS => ['category_id' => self::CATEGORIES],
        self::ASSIGNMENTS => ['item_id' => self::ITEMS, 'tag_id' => self::TAGS],
    ];

    /** @var list<array{0: string, 1: string}> tables outside the catalog with a nullable catalog item foreign key */
    private const EXTERNAL_ITEM_REFERENCES = [
        ['offered_services', 'catalog_item_id'],
        ['client_service_histories', 'catalog_item_id'],
    ];

    /** @var list<array{0: string, 1: string, 2: string}> table, morph type column, morph id column */
    private const ITEM_MORPHS = [
        ['client_favorites', 'favorable_type', 'favorable_id'],
        ['client_interaction_logs', 'interactable_type', 'interactable_id'],
        ['recommendation_edges', 'source_type', 'source_id'],
        ['recommendation_edges', 'target_type', 'target_id'],
    ];

    private const ITEM_MORPH_TYPE = 'catalog_item';

    private const CATEGORY_MORPH_TYPE = 'catalog_category';

    private const INSERT_CHUNK = 200;

    public function up(): void
    {
        $this->rekey(toUuid: true);
    }

    public function down(): void
    {
        $this->rekey(toUuid: false);
    }

    private function rekey(bool $toUuid): void
    {
        Schema::disableForeignKeyConstraints();

        $rows = [];
        $maps = [];
        foreach (self::CATALOG_TABLES as $table) {
            $rows[$table] = DB::table($table)->orderBy('id')->get()->map(fn (object $row): array => (array) $row)->all();
            $maps[$table] = $this->newKeys($rows[$table], $toUuid);
        }

        foreach (self::EXTERNAL_ITEM_REFERENCES as [$table, $column]) {
            $this->remapExternalReference($table, $column, $maps[self::ITEMS], $toUuid);
        }

        $this->remapItemMorphs($maps[self::ITEMS]);
        $this->remapSavedFilters($maps[self::ITEMS]);
        $this->remapFaceRecommendations($maps[self::ITEMS]);

        foreach (array_reverse(self::CATALOG_TABLES) as $table) {
            Schema::drop($table);
        }

        $this->createCatalogTables($toUuid);

        foreach (self::CATALOG_TABLES as $table) {
            $remapped = array_map(fn (array $row): array => $this->remapCatalogRow($table, $row, $maps), $rows[$table]);
            foreach (array_chunk($remapped, self::INSERT_CHUNK) as $chunk) {
                DB::table($table)->insert($chunk);
            }
        }

        foreach (self::EXTERNAL_ITEM_REFERENCES as [$table, $column]) {
            Schema::table($table, fn (Blueprint $blueprint) => $blueprint
                ->foreign($column)
                ->references('id')
                ->on(self::ITEMS)
                ->nullOnDelete());
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return array<string, string|int> old key => new key
     */
    private function newKeys(array $rows, bool $toUuid): array
    {
        $map = [];
        $next = 1;
        foreach ($rows as $row) {
            $map[(string) $row['id']] = $toUuid ? (string) Str::uuid7() : $next++;
        }

        return $map;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, array<string, string|int>>  $maps
     * @return array<string, mixed>
     */
    private function remapCatalogRow(string $table, array $row, array $maps): array
    {
        $row['id'] = $maps[$table][(string) $row['id']];

        foreach (self::CATALOG_REFERENCES[$table] ?? [] as $column => $parent) {
            if ($row[$column] !== null) {
                $row[$column] = $maps[$parent][(string) $row[$column]];
            }
        }

        if ($table === self::MEDIA) {
            $row['mediable_id'] = $this->remapMediaOwner($row, $maps);
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, array<string, string|int>>  $maps
     */
    private function remapMediaOwner(array $row, array $maps): string|int
    {
        $ownerTable = match ($row['mediable_type']) {
            ServiceCatalogItemModel::class, self::ITEM_MORPH_TYPE => self::ITEMS,
            ServiceCatalogCategoryModel::class, self::CATEGORY_MORPH_TYPE => self::CATEGORIES,
            default => null,
        };

        if ($ownerTable === null || ! isset($maps[$ownerTable][(string) $row['mediable_id']])) {
            return $row['mediable_id'];
        }

        return $maps[$ownerTable][(string) $row['mediable_id']];
    }

    /** @param array<string, string|int> $itemMap */
    private function remapExternalReference(string $table, string $column, array $itemMap, bool $toUuid): void
    {
        $newColumn = $column.'_rekeyed';

        Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropForeign([$column]));
        Schema::table($table, fn (Blueprint $blueprint) => $toUuid
            ? $blueprint->uuid($newColumn)->nullable()
            : $blueprint->unsignedBigInteger($newColumn)->nullable());

        foreach ($itemMap as $oldId => $newId) {
            DB::table($table)->where($column, $oldId)->update([$newColumn => $newId]);
        }

        Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropColumn($column));
        Schema::table($table, fn (Blueprint $blueprint) => $blueprint->renameColumn($newColumn, $column));
    }

    /** @param array<string, string|int> $itemMap */
    private function remapItemMorphs(array $itemMap): void
    {
        foreach (self::ITEM_MORPHS as [$table, $typeColumn, $idColumn]) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            // Collect first so a value that was just remapped is never matched again as an old key.
            $rows = DB::table($table)
                ->where($typeColumn, self::ITEM_MORPH_TYPE)
                ->whereIn($idColumn, array_map('strval', array_keys($itemMap)))
                ->get(['id', $idColumn]);

            foreach ($rows as $row) {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update([$idColumn => (string) $itemMap[(string) $row->{$idColumn}]]);
            }
        }
    }

    /** @param array<string, string|int> $itemMap */
    private function remapSavedFilters(array $itemMap): void
    {
        if (! Schema::hasTable('client_saved_filters')) {
            return;
        }

        $rows = DB::table('client_saved_filters')->where('filter_config', 'like', '%catalog_item_ids%')->get(['id', 'filter_config']);
        foreach ($rows as $row) {
            $config = json_decode((string) $row->filter_config, true);
            if (! is_array($config) || ! is_array($config['catalog_item_ids'] ?? null)) {
                continue;
            }

            $config['catalog_item_ids'] = $this->mapIds($config['catalog_item_ids'], $itemMap);
            DB::table('client_saved_filters')->where('id', $row->id)->update(['filter_config' => json_encode($config)]);
        }
    }

    /** @param array<string, string|int> $itemMap */
    private function remapFaceRecommendations(array $itemMap): void
    {
        if (! Schema::hasTable('client_face_analysis_results')) {
            return;
        }

        $rows = DB::table('client_face_analysis_results')->whereNotNull('recommended_catalog_item_ids')->get(['id', 'recommended_catalog_item_ids']);
        foreach ($rows as $row) {
            $recommendations = json_decode((string) $row->recommended_catalog_item_ids, true);
            if (! is_array($recommendations) || ! is_array($recommendations['ids'] ?? null)) {
                continue;
            }

            $recommendations['ids'] = $this->mapIds($recommendations['ids'], $itemMap);
            DB::table('client_face_analysis_results')
                ->where('id', $row->id)
                ->update(['recommended_catalog_item_ids' => json_encode($recommendations)]);
        }
    }

    /**
     * Ids that no longer resolve to a catalog row are dropped instead of being kept as dangling references.
     *
     * @param  array<mixed>  $ids
     * @param  array<string, string|int>  $map
     * @return list<string|int>
     */
    private function mapIds(array $ids, array $map): array
    {
        $mapped = [];
        foreach ($ids as $id) {
            if (is_scalar($id) && isset($map[(string) $id])) {
                $mapped[] = $map[(string) $id];
            }
        }

        return $mapped;
    }

    private function createCatalogTables(bool $toUuid): void
    {
        Schema::create(self::CATEGORIES, function (Blueprint $table) use ($toUuid) {
            $this->primaryKey($table, $toUuid);
            $table->json('name');
            $table->json('description')->nullable();
            $table->string('slug')->unique();
            $this->foreignKey($table, 'parent_id', $toUuid)->nullable()->constrained(self::CATEGORIES)->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create(self::ITEMS, function (Blueprint $table) use ($toUuid) {
            $this->primaryKey($table, $toUuid);
            $this->foreignKey($table, 'category_id', $toUuid)->constrained(self::CATEGORIES)->cascadeOnDelete();
            $table->json('name');
            $table->json('description')->nullable();
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->json('price_range')->nullable();
            $table->string('maintenance_level')->nullable();
            $table->string('style_period')->nullable();
            $table->string('formality')->nullable();
            $table->json('face_shapes')->nullable();
            $table->json('hair_textures')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create(self::TAGS, function (Blueprint $table) use ($toUuid) {
            $this->primaryKey($table, $toUuid);
            $table->json('name');
            $table->string('slug')->unique();
            $table->string('group')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create(self::ASSIGNMENTS, function (Blueprint $table) use ($toUuid) {
            $this->primaryKey($table, $toUuid);
            $this->foreignKey($table, 'item_id', $toUuid)->constrained(self::ITEMS)->cascadeOnDelete();
            $this->foreignKey($table, 'tag_id', $toUuid)->constrained(self::TAGS)->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['item_id', 'tag_id']);
        });

        Schema::create(self::MEDIA, function (Blueprint $table) use ($toUuid) {
            $this->primaryKey($table, $toUuid);
            if ($toUuid) {
                $table->uuidMorphs('mediable');
            } else {
                $table->morphs('mediable');
            }
            $table->string('type')->default('image');
            $table->string('path');
            $table->string('alt')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    private function primaryKey(Blueprint $table, bool $toUuid): void
    {
        if ($toUuid) {
            $table->uuid('id')->primary();

            return;
        }

        $table->id();
    }

    private function foreignKey(Blueprint $table, string $column, bool $toUuid): ForeignIdColumnDefinition
    {
        return $toUuid ? $table->foreignUuid($column) : $table->foreignId($column);
    }
};
