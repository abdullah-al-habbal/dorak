<?php

declare(strict_types=1);

use Tests\Support\TestDatabaseGuard;

it('accepts MySQL dorak_test and its parallel worker copies', function (string $database): void {
    TestDatabaseGuard::assertSafe('testing', 'mysql', $database);

    expect(true)->toBeTrue();
})->with(['dorak_test', 'dorak_test_1', 'dorak_test_12']);

it('refuses any engine but MySQL, any other database and any other environment', function (string $environment, string $driver, ?string $database): void {
    expect(fn () => TestDatabaseGuard::assertSafe($environment, $driver, $database))->toThrow(LogicException::class);
})->with([
    'sqlite memory' => ['testing', 'sqlite', ':memory:'],
    'sqlite named dorak_test' => ['testing', 'sqlite', 'dorak_test'],
    'mariadb driver' => ['testing', 'mariadb', 'dorak_test'],
    'development database' => ['testing', 'mysql', 'dorak_backend_development_db'],
    'production-like name' => ['testing', 'mysql', 'dorak'],
    'prefix trick' => ['testing', 'mysql', 'dorak_test_backup'],
    'suffix trick' => ['testing', 'mysql', 'x_dorak_test'],
    'no database' => ['testing', 'mysql', null],
    'wrong environment' => ['local', 'mysql', 'dorak_test'],
]);

it('is wired into the base test case so every suite runs the check before migrating', function (): void {
    $source = file_get_contents(base_path('tests/TestCase.php'));

    expect($source)->toContain('setUpTraits')->toContain('TestDatabaseGuard::assertSafe');
});

it('runs this suite on MySQL dorak_test', function (): void {
    expect(DB::connection()->getDriverName())->toBe('mysql')->and(DB::connection()->getDatabaseName())->toMatch(TestDatabaseGuard::DATABASE_PATTERN);
});
