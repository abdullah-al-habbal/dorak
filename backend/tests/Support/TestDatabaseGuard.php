<?php

declare(strict_types=1);

namespace Tests\Support;

use LogicException;

/**
 * Fails fast when the suite is not pointed at the dedicated MySQL test database.
 *
 * MySQL is the only engine automated tests run on (transactions, locks, unique indexes and DDL behave
 * differently elsewhere). The database name must be `dorak_test`, optionally suffixed `_<n>` for parallel
 * workers, so the development and production databases can never be migrated or wiped by a test run.
 */
final class TestDatabaseGuard
{
    public const string DRIVER = 'mysql';

    public const string DATABASE_PATTERN = '/^dorak_test(_\d+)?$/';

    public static function assertSafe(string $environment, string $driver, ?string $database): void
    {
        if ($environment !== 'testing') {
            throw new LogicException(sprintf('Tests must run with APP_ENV=testing, got "%s".', $environment));
        }

        if ($driver !== self::DRIVER) {
            throw new LogicException(sprintf('Tests run on MySQL only, the "%s" driver is not supported. Set DB_CONNECTION=mysql.', $driver));
        }

        if ($database === null || preg_match(self::DATABASE_PATTERN, $database) !== 1) {
            throw new LogicException(sprintf('Tests may only use the "dorak_test" database, got "%s". Refusing to migrate it.', (string) $database));
        }
    }
}
