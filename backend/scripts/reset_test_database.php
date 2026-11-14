<?php

declare(strict_types=1);

/**
 * Recreates the single automated-test database from a clean state: drops and creates `dorak_test`, then runs
 * the project's migrations. Run before each complete suite (`composer test`, CI).
 *
 * Safety: it forces the same environment as phpunit.xml (MySQL 8.4 on 127.0.0.1:3307), boots the app and runs Tests\Support\TestDatabaseGuard
 * on the resolved connection first. Anything but a local MySQL `dorak_test` as APP_ENV=testing exits non-zero
 * before a single statement is sent. It never takes a database name from an argument and never touches any
 * other database. Any change to this policy requires explicit approval.
 */

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\Support\TestDatabaseGuard;

require __DIR__.'/../vendor/autoload.php';
require __DIR__.'/../tests/Support/TestDatabaseGuard.php';

// Same connection phpunit.xml forces: the dedicated MySQL 8.4 test server (composer test:db:up), nothing else.
foreach (['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_HOST' => '127.0.0.1', 'DB_PORT' => (string) TestDatabaseGuard::PORT, 'DB_USERNAME' => 'root', 'DB_PASSWORD' => 'root', 'DB_DATABASE' => TestDatabaseGuard::DATABASE, 'DB_URL' => ''] as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $_SERVER[$key] = $value;
}

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

try {
    TestDatabaseGuard::assertSafe((string) $app->environment(), DB::connection()->getConfig());

    TestDatabaseGuard::assertServer(
        fn (): string => (string) DB::selectOne('select version() as version')->version,
        DB::connection()->getConfig(),
    );

    $database = TestDatabaseGuard::DATABASE;
    DB::statement("DROP DATABASE IF EXISTS `{$database}`");
    DB::statement("CREATE DATABASE `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    DB::purge();
    Artisan::call('migrate:fresh', ['--force' => true]);
    fwrite(STDOUT, "Recreated `{$database}` and ran migrations.\n");
} catch (Throwable $e) {
    fwrite(STDERR, 'Test database NOT reset: '.$e->getMessage()."\n");
    exit(1);
}
