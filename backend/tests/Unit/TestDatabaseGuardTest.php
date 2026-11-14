<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Tests\Support\TestDatabaseGuard;

/** @return array<string, mixed> */
function guardConnection(array $overrides = []): array
{
    return array_merge(['driver' => 'mysql', 'database' => 'dorak_test', 'host' => '127.0.0.1', 'port' => 3307, 'username' => 'root', 'unix_socket' => ''], $overrides);
}

it('accepts only a local MySQL dorak_test', function (array $overrides): void {
    expect(fn () => TestDatabaseGuard::assertSafe('testing', guardConnection($overrides)))->not->toThrow(LogicException::class);
})->with([
    'defaults' => [[]],
    'localhost' => [['host' => 'localhost']],
    'ipv6 loopback' => [['host' => '::1']],
    'port given as text' => [['port' => '3307']],
    'dedicated account' => [['username' => 'dorak_test_runner']],
]);

it('refuses any other environment, engine, database, host, port or account', function (string $environment, array $overrides): void {
    expect(fn () => TestDatabaseGuard::assertSafe($environment, guardConnection($overrides)))->toThrow(LogicException::class);
})->with([
    'wrong environment' => ['local', []],
    'production environment' => ['production', []],
    'sqlite memory' => ['testing', ['driver' => 'sqlite', 'database' => ':memory:']],
    'sqlite named dorak_test' => ['testing', ['driver' => 'sqlite']],
    'mariadb driver' => ['testing', ['driver' => 'mariadb']],
    'development database' => ['testing', ['database' => 'dorak_backend_development_db']],
    'production-like name' => ['testing', ['database' => 'dorak']],
    'worker copy' => ['testing', ['database' => 'dorak_test_12']],
    'laravel worker copy' => ['testing', ['database' => 'dorak_test_test_1']],
    'prefix trick' => ['testing', ['database' => 'dorak_test_backup']],
    'suffix trick' => ['testing', ['database' => 'x_dorak_test']],
    'no database' => ['testing', ['database' => null]],
    'remote host' => ['testing', ['host' => 'db.internal.example.com']],
    'remote ip' => ['testing', ['host' => '10.0.0.5']],
    'loopback lookalike' => ['testing', ['host' => '127.0.0.1.evil.example']],
    'empty host without socket' => ['testing', ['host' => '']],
    'unexpected port' => ['testing', ['port' => 3308]],
    'development server port' => ['testing', ['port' => 3306]],
    'unix socket' => ['testing', ['host' => '', 'port' => '', 'unix_socket' => '/var/run/mysqld/mysqld.sock']],
    'unix socket beside a good host' => ['testing', ['unix_socket' => '/var/run/mysqld/mysqld.sock']],
    'no port' => ['testing', ['port' => null]],
    'application account' => ['testing', ['username' => 'dorak_app']],
    'account prefix trick' => ['testing', ['username' => 'root_backup']],
    'no account' => ['testing', ['username' => null]],
]);

it('refuses a parallel worker before it can create a database', function (string $marker, mixed $value): void {
    expect(fn () => TestDatabaseGuard::assertSequential([$marker => $value]))->toThrow(LogicException::class, 'Parallel test execution is prohibited');
})->with([
    'laravel flag' => ['LARAVEL_PARALLEL_TESTING', '1'],
    'worker token' => ['TEST_TOKEN', '3'],
    'paratest' => ['PARATEST', '1'],
]);

it('allows a sequential run', function (): void {
    expect(fn () => TestDatabaseGuard::assertSequential([]))->not->toThrow(LogicException::class);
});

it('refuses even a perfect connection when a parallel marker is present', function (): void {
    expect(fn () => TestDatabaseGuard::assertSafe('testing', guardConnection()))->not->toThrow(LogicException::class);
    $_SERVER['TEST_TOKEN'] = '2';
    try {
        expect(fn () => TestDatabaseGuard::assertSafe('testing', guardConnection()))->toThrow(LogicException::class, 'Parallel');
    } finally {
        unset($_SERVER['TEST_TOKEN']);
    }
});

it('runs the guard before any trait set-up and stops a connection pointed at a remote host', function (): void {
    $original = config('database.connections.mysql.host');
    config(['database.connections.mysql.host' => 'db.internal.example.com']);
    DB::purge('mysql');

    try {
        expect(fn () => (fn () => $this->setUpTraits())->call($this))->toThrow(LogicException::class, 'db.internal.example.com');
    } finally {
        config(['database.connections.mysql.host' => $original]);
        DB::purge('mysql');
    }
});

it('runs this suite on a local MySQL dorak_test connection', function (): void {
    $config = DB::connection()->getConfig();

    expect($config['driver'])->toBe('mysql')->and($config['database'])->toBe(TestDatabaseGuard::DATABASE);
    TestDatabaseGuard::assertSafe((string) app()->environment(), $config);
});

it('accepts only MySQL 8.4 servers', function (string $version): void {
    expect(fn () => TestDatabaseGuard::assertServerIsMysql84($version))->not->toThrow(LogicException::class);
})->with(['8.4.0', '8.4.13', '8.4.2-commercial', '8.4.13-0ubuntu0.24.04.1']);

it('refuses MariaDB and every other server version instead of treating it as MySQL 8.4', function (string $version): void {
    expect(fn () => TestDatabaseGuard::assertServerIsMysql84($version))->toThrow(LogicException::class, 'MySQL 8.4 only');
})->with(['11.8.6-MariaDB-5ubuntu0.1', '10.11.6-MariaDB', '5.5.5-10.11.6-MariaDB-1:10.11.6+maria~ubu2204', '8.4.1-MariaDB', '8.0.36', '8.1.0', '8.40.1', '9.0.1', '5.7.44', '', 'x8.4.1']);

it('reads the server version through the connection and accepts MySQL 8.4', function (): void {
    expect(fn () => TestDatabaseGuard::assertServer(fn (): string => '8.4.13', guardConnection()))->not->toThrow(LogicException::class);
});

it('explains how to start the test server when it is not reachable, and never falls back', function (): void {
    $unreachable = fn (): string => throw new PDOException('SQLSTATE[HY000] [2002] Connection refused');

    expect(fn () => TestDatabaseGuard::assertServer($unreachable, guardConnection()))
        ->toThrow(LogicException::class, 'composer test:db:up');
    expect(fn () => TestDatabaseGuard::assertServer($unreachable, guardConnection()))
        ->toThrow(LogicException::class, '127.0.0.1:3307');
});

it('refuses a reachable MariaDB server through the same path', function (): void {
    expect(fn () => TestDatabaseGuard::assertServer(fn (): string => '11.8.6-MariaDB', guardConnection()))
        ->toThrow(LogicException::class, 'MySQL 8.4 only');
});

it('runs this suite against the dedicated MySQL 8.4 test server', function (): void {
    expect(DB::selectOne('select version() as version')->version)->toStartWith('8.4.')
        ->and((int) DB::connection()->getConfig()['port'])->toBe(3307);
});

/** @return array<string, string> */
function guardEnvironment(array $overrides = []): array
{
    return array_merge(['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_HOST' => '127.0.0.1', 'DB_PORT' => '3307', 'DB_USERNAME' => 'root', 'DB_DATABASE' => 'dorak_test', 'DB_URL' => ''], $overrides);
}

it('accepts the environment phpunit.xml forces, before Laravel is booted', function (): void {
    expect(fn () => TestDatabaseGuard::assertSafeEnvironment(guardEnvironment()))->not->toThrow(LogicException::class);
});

it('refuses an unsafe process environment without opening a connection', function (array $overrides): void {
    expect(fn () => TestDatabaseGuard::assertSafeEnvironment(guardEnvironment($overrides)))->toThrow(LogicException::class);
})->with([
    'development database' => [['DB_DATABASE' => 'dorak_backend_development_db']],
    'development server port' => [['DB_PORT' => '3306']],
    'remote host' => [['DB_HOST' => 'db.internal.example.com']],
    'sqlite' => [['DB_CONNECTION' => 'sqlite']],
    'wrong environment' => [['APP_ENV' => 'local']],
    'unix socket' => [['DB_SOCKET' => '/var/run/mysqld/mysqld.sock']],
    'database url override' => [['DB_URL' => 'mysql://u:p@db.example.com/prod']],
    'missing database' => [['DB_DATABASE' => '']],
]);

it('stops the PHPUnit bootstrap with a non-zero exit before the framework boots or any database is contacted', function (): void {
    $backend = dirname(__DIR__, 2);
    $environment = array_merge(getenv(), guardEnvironment(['DB_DATABASE' => 'dorak_production', 'DB_HOST' => '203.0.113.7']));
    // The bootstrap must fail on configuration alone: Laravel's autoloaded app class never has to exist for it.
    $script = 'require '.var_export($backend.'/tests/bootstrap.php', true).'; echo "BOOTSTRAP_PASSED";';
    $process = proc_open([PHP_BINARY, '-r', $script], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $backend, $environment);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    $exit = proc_close($process);

    expect($exit)->toBe(1)
        ->and($stdout)->not->toContain('BOOTSTRAP_PASSED')
        ->and($stderr)->toContain('Refusing to run tests')
        ->and($stderr)->toContain('dorak_production')
        ->and($stderr)->not->toContain('SQLSTATE')
        ->and($stderr)->not->toContain('not reachable');
});

it('lets the PHPUnit bootstrap through for the dedicated test server configuration', function (): void {
    $backend = dirname(__DIR__, 2);
    $script = 'require '.var_export($backend.'/tests/bootstrap.php', true).'; echo "BOOTSTRAP_PASSED";';
    $process = proc_open([PHP_BINARY, '-r', $script], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $backend, array_merge(getenv(), guardEnvironment()));
    $stdout = stream_get_contents($pipes[1]);
    stream_get_contents($pipes[2]);

    expect(proc_close($process))->toBe(0)->and($stdout)->toBe('BOOTSTRAP_PASSED');
});

it('configures the bootstrap in phpunit.xml', function (): void {
    expect(file_get_contents(dirname(__DIR__, 2).'/phpunit.xml'))->toContain('bootstrap="tests/bootstrap.php"');
});
