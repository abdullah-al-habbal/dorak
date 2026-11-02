<?php

declare(strict_types=1);

/**
 * Architectural guardrail: scans every module and framework migration and fails
 * when a column name breaks the schema naming contract documented in
 * the `database-conventions` skill and `backend/docs/04-house-rules.md`.
 */
const SCHEMA_COLUMN_CALL_PATTERN = '/\$table->(?<method>[A-Za-z]+)\(\s*[\'"](?<column>[A-Za-z0-9_]+)[\'"]/';
const SCHEMA_FOREIGN_METHODS = ['foreignUuid', 'foreignId', 'foreign'];
const SCHEMA_BOOLEAN_PREFIXES = ['is_', 'has_', 'allows_', 'requires_'];
const SCHEMA_FOREIGN_SUFFIXES = ['_id', '_code'];

/**
 * @return array<string, list<array{method: string, column: string}>> columns keyed by migration path
 */
function schemaMigrationColumns(): array
{
    $root = dirname(__DIR__, 3);
    $paths = array_merge(
        glob($root.'/modules/*/Database/Migrations/*.php') ?: [],
        glob($root.'/database/migrations/*.php') ?: [],
    );
    $columns = [];

    foreach ($paths as $path) {
        preg_match_all(SCHEMA_COLUMN_CALL_PATTERN, (string) file_get_contents($path), $matches, PREG_SET_ORDER);
        $relative = substr($path, strlen($root) + 1);
        $columns[$relative] = array_map(
            static fn (array $match): array => ['method' => $match['method'], 'column' => $match['column']],
            $matches,
        );
    }

    return $columns;
}

/**
 * @param  callable(string, string): bool  $isViolation  receives method and column name
 * @return list<string> "path: column" entries that violate the rule
 */
function schemaViolations(callable $isViolation): array
{
    $violations = [];

    foreach (schemaMigrationColumns() as $path => $columns) {
        foreach ($columns as $entry) {
            if ($isViolation($entry['method'], $entry['column'])) {
                $violations[] = $path.': '.$entry['column'];
            }
        }
    }

    return $violations;
}

describe('Schema naming conventions', function (): void {
    it('discovers migrations to lint', function (): void {
        expect(schemaMigrationColumns())->not->toBeEmpty()
            ->and(array_sum(array_map('count', schemaMigrationColumns())))->toBeGreaterThan(100);
    });

    it('uses *_amount_minor for minor currency units', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => str_ends_with($column, '_minor')
                && ! str_ends_with($column, '_amount_minor'),
        );

        expect($violations)->toBe([]);
    });

    it('names boolean columns with an is_, has_, allows_ or requires_ prefix', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => $method === 'boolean'
                && array_filter(SCHEMA_BOOLEAN_PREFIXES, static fn (string $prefix): bool => str_starts_with($column, $prefix)) === [],
        );

        expect($violations)->toBe([]);
    });

    it('never uses *_enabled column names', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => str_ends_with($column, '_enabled'),
        );

        expect($violations)->toBe([]);
    });

    it('spells cancelled with two l characters', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => str_contains($column, 'canceled'),
        );

        expect($violations)->toBe([]);

        foreach (array_keys(schemaMigrationColumns()) as $path) {
            expect((string) file_get_contents(dirname(__DIR__, 3).'/'.$path))->not->toContain('canceled');
        }
    });

    it('references currencies through currency_code, never currency_id', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => str_ends_with($column, 'currency_id'),
        );

        expect($violations)->toBe([]);
    });

    it('suffixes foreign keys with _id or _code', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => in_array($method, SCHEMA_FOREIGN_METHODS, true)
                && array_filter(SCHEMA_FOREIGN_SUFFIXES, static fn (string $suffix): bool => str_ends_with($column, $suffix)) === [],
        );

        expect($violations)->toBe([]);
    });

    it('never uses bare *_by actor columns', function (): void {
        $violations = schemaViolations(
            static fn (string $method, string $column): bool => str_ends_with($column, '_by'),
        );

        expect($violations)->toBe([]);
    });
});
