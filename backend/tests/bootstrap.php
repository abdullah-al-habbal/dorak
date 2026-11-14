<?php

declare(strict_types=1);

use Tests\Support\TestDatabaseGuard;

/**
 * PHPUnit bootstrap (phpunit.xml). Runs before any test, provider or database connection exists: an environment that
 * is not the dedicated local MySQL `dorak_test` stops the run here with a non-zero exit, before Laravel boots.
 * TestCase repeats the check on the resolved connection (defence in depth).
 */
require __DIR__.'/../vendor/autoload.php';
require __DIR__.'/Support/TestDatabaseGuard.php';

try {
    TestDatabaseGuard::assertSafeEnvironment();
} catch (Throwable $e) {
    fwrite(STDERR, 'Refusing to run tests: '.$e->getMessage().PHP_EOL);
    exit(1);
}
