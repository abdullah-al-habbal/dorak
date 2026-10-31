<?php

declare(strict_types=1);

final class MigrationGuardConstants
{
    public const int MIGRATION_GUARD_EXIT_OK = 0;

    public const int MIGRATION_GUARD_EXIT_VIOLATION = 1;

    public const int MIGRATION_GUARD_EXIT_USAGE = 2;

    public const array MIGRATION_GUARD_MIGRATION_GLOBS = [
        'modules/*/Database/Migrations/*.php',
        'database/migrations/*.php',
    ];

    /** Destructive schema operations. Safe in down(); never in up() without opt-out. */
    public const array MIGRATION_GUARD_DESTRUCTIVE = [
        'dropColumn' => 'drops a column',
        'dropForeign' => 'drops a foreign key',
        'dropIndex' => 'drops an index',
        'dropUnique' => 'drops a unique constraint',
        'dropPrimary' => 'drops a primary key',
        'dropConstrainedForeignId' => 'drops a constrained foreign id',
        'renameColumn' => 'renames a column',
        '->change()' => 'alters an existing column (type/nullability)',
        'Schema::rename' => 'renames a table',
        'Schema::drop(' => 'drops a table',
    ];

    public const string MIGRATION_GUARD_OPT_OUT = '@contract-migration:';

    /** Blueprint calls that are not real columns, or are inherently nullable. */
    public const array MIGRATION_GUARD_NON_COLUMN_CALLS = [
        'softDeletes', 'timestamps', 'rememberToken', 'index', 'unique', 'primary',
        'foreign', 'references', 'on', 'onDelete', 'onUpdate', 'constrained',
        'nullOnDelete', 'cascadeOnDelete', 'restrictOnDelete', 'comment', 'after',
        'change', 'spatialIndex', 'fullText', 'rawIndex',
        // Removals and renames are reported by the DESTRUCTIVE scan. Without these
        // here, `dropColumn('phone')` also gets misreported as a NOT NULL addition.
        'dropColumn', 'dropForeign', 'dropIndex', 'dropUnique', 'dropPrimary',
        'dropConstrainedForeignId', 'dropSoftDeletes', 'dropTimestamps',
        'dropRememberToken', 'dropMorphs', 'renameColumn', 'renameIndex',
    ];
}
