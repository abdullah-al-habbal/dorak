<?php

declare(strict_types=1);

namespace Tests\Support;

use Closure;
use LogicException;
use Throwable;

/**
 * Fails fast, before any `migrate:fresh`, unless the suite is pointed at a dedicated local MySQL test database.
 *
 * Fails closed: anything unexpected throws. Checked: sequential run, server version (MySQL 8.4 only), APP_ENV, driver, database name, host (or unix socket), port and username. This is a configuration
 * allow-list, not proof that the server holds no real data: a development database that is itself named
 * `dorak_test` on a local default port would still pass. Keep development data in a differently named database.
 */
final class TestDatabaseGuard
{
    public const string ENVIRONMENT = 'testing';

    public const string DRIVER = 'mysql';

    /** The one and only automated-test database. Worker or per-suite copies are prohibited (see docs/architecture/testing-strategy.md). */
    public const string DATABASE = 'dorak_test';

    public const string DATABASE_PATTERN = '/^dorak_test$/';

    /** Variables Laravel and Paratest set in a parallel worker, which would create `dorak_test_test_<n>` databases. */
    public const array PARALLEL_MARKERS = ['LARAVEL_PARALLEL_TESTING', 'TEST_TOKEN', 'PARATEST'];

    /** Integration tests run on MySQL 8.4 only, locally and in CI. MariaDB and every other version are refused, never treated as equivalent. */
    public const string MYSQL_VERSION = '8.4';

    /** Hosts that are this machine or the CI service container reached over loopback. */
    public const array HOSTS = ['127.0.0.1', 'localhost', '::1'];

    /** The dedicated test server (backend/docker-compose.test.yml, CI service). Never 3306: that is where a development server listens. */
    public const int PORT = 3307;

    /** `root` is the CI service user and the local default; `dorak_test*` is for a dedicated account. */
    public const string USERNAME_PATTERN = '/^(root|dorak_test(_\w+)?)$/';

    /**
     * @param  array<string, mixed>  $connection  The resolved `mysql` connection config.
     */
    public static function assertSafe(string $environment, array $connection): void
    {
        self::assertSequential();

        if ($environment !== self::ENVIRONMENT) {
            throw new LogicException(sprintf('Tests must run with APP_ENV=testing, got "%s".', $environment));
        }

        $driver = (string) ($connection['driver'] ?? '');
        if ($driver !== self::DRIVER) {
            throw new LogicException(sprintf('Tests run on MySQL only, the "%s" driver is not supported. Set DB_CONNECTION=mysql.', $driver));
        }

        $database = $connection['database'] ?? null;
        if (! is_string($database) || preg_match(self::DATABASE_PATTERN, $database) !== 1) {
            throw new LogicException(sprintf('Tests may only use the "dorak_test" database, got "%s". Refusing to migrate it.', (string) $database));
        }

        self::assertLocalEndpoint($connection);

        $username = (string) ($connection['username'] ?? '');
        if (preg_match(self::USERNAME_PATTERN, $username) !== 1) {
            throw new LogicException(sprintf('Tests may only connect as "root" or "dorak_test*", got "%s".', $username));
        }
    }

    /**
     * Pre-boot check for the PHPUnit bootstrap: judges the process environment (what phpunit.xml forces) with the
     * same rules as `assertSafe`, before Laravel is loaded, so before any provider, connection or migration exists.
     * It opens no connection. A non-empty DB_URL is refused because Laravel would let it override every field above.
     *
     * @param  array<string, mixed>  $environment  Defaults to the process environment.
     */
    public static function assertSafeEnvironment(?array $environment = null): void
    {
        $read = static fn (string $key): mixed => $environment === null ? ($_SERVER[$key] ?? getenv($key)) : ($environment[$key] ?? null);

        if ((string) ($read('DB_URL') ?? '') !== '') {
            throw new LogicException('DB_URL must be empty for tests: it would override the connection settings the guard checks.');
        }

        self::assertSafe((string) ($read('APP_ENV') ?? ''), [
            'driver' => $read('DB_CONNECTION') === false ? null : $read('DB_CONNECTION'),
            'database' => $read('DB_DATABASE') === false ? null : $read('DB_DATABASE'),
            'host' => $read('DB_HOST') === false ? null : $read('DB_HOST'),
            'port' => $read('DB_PORT') === false ? null : $read('DB_PORT'),
            'username' => $read('DB_USERNAME') === false ? null : $read('DB_USERNAME'),
            'unix_socket' => $read('DB_SOCKET') === false ? null : $read('DB_SOCKET'),
        ]);
    }

    /**
     * Reads the server version through the given callable and refuses anything but MySQL 8.4. An unreachable server
     * gets a clear instruction instead of a driver error.
     *
     * @param  Closure(): string  $readVersion  Returns `select version()`.
     * @param  array<string, mixed>  $connection  The resolved connection config, used only for the message.
     */
    public static function assertServer(Closure $readVersion, array $connection): void
    {
        try {
            $version = $readVersion();
        } catch (Throwable $e) {
            throw new LogicException(sprintf(
                'The MySQL %s test server is not reachable at %s:%s. Start it with `composer test:db:up` (backend/docker-compose.test.yml). Tests never fall back to another server.',
                self::MYSQL_VERSION,
                (string) ($connection['host'] ?? '?'),
                (string) ($connection['port'] ?? '?'),
            ), 0, $e);
        }

        self::assertServerIsMysql84($version);
    }

    /**
     * @param  string  $version  The server's `select version()`, for example "8.4.13" or "11.8.6-MariaDB-5ubuntu0.1".
     */
    public static function assertServerIsMysql84(string $version): void
    {
        if (stripos($version, 'mariadb') !== false || preg_match('/^'.preg_quote(self::MYSQL_VERSION, '/').'\.\d+/', $version) !== 1) {
            throw new LogicException(sprintf(
                'Tests run on MySQL %s only, this server reports "%s". MariaDB and other versions are not treated as equivalent: start the test server with `composer test:db:up`.',
                self::MYSQL_VERSION,
                $version,
            ));
        }
    }

    /**
     * Parallel runs clone the test database per worker. That is prohibited: one database, sequential runs.
     * Must run before Laravel's per-worker database creation, hence the call from `refreshApplication`.
     *
     * @param  array<string, mixed>  $server  Defaults to the process superglobal and environment.
     */
    public static function assertSequential(?array $server = null): void
    {
        foreach (self::PARALLEL_MARKERS as $marker) {
            $value = $server === null ? ($_SERVER[$marker] ?? getenv($marker)) : ($server[$marker] ?? null);
            if (! in_array($value, [null, false, '', '0', 0], true)) {
                throw new LogicException('Parallel test execution is prohibited: tests run sequentially against the single "dorak_test" database. Do not pass --parallel.');
            }
        }
    }

    /**
     * @param  array<string, mixed>  $connection
     */
    private static function assertLocalEndpoint(array $connection): void
    {
        if ((string) ($connection['unix_socket'] ?? '') !== '') {
            throw new LogicException('Tests may not connect through a unix socket: it can point at any local server. Use TCP to the dedicated test server.');
        }

        $host = (string) ($connection['host'] ?? '');
        if (! in_array($host, self::HOSTS, true)) {
            throw new LogicException(sprintf('Tests may only connect to a local MySQL (%s), got host "%s".', implode(', ', self::HOSTS), $host));
        }

        $port = (int) ($connection['port'] ?? 0);
        if ($port !== self::PORT) {
            throw new LogicException(sprintf('Tests may only use the dedicated test server on port %d, got "%d".', self::PORT, $port));
        }
    }
}
