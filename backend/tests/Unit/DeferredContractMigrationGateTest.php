<?php

declare(strict_types=1);

use Modules\JobPosting\Support\DeferredContractMigrationGate;

afterEach(fn () => putenv('DEFER_CONTRACT_MIGRATIONS'));

it('defers only while the deploy variable is set to a real value in the process environment', function (?string $value, bool $deferred): void {
    $value === null ? putenv('DEFER_CONTRACT_MIGRATIONS') : putenv("DEFER_CONTRACT_MIGRATIONS={$value}");

    expect(DeferredContractMigrationGate::isDeferred())->toBe($deferred);
})->with([
    'unset runs the migration' => [null, false],
    'empty runs the migration' => ['', false],
    'zero runs the migration' => ['0', false],
    'one defers' => ['1', true],
]);

it('is not influenced by .env or config, only by the process environment', function (): void {
    config(['DEFER_CONTRACT_MIGRATIONS' => '1', 'app.DEFER_CONTRACT_MIGRATIONS' => '1']);
    $_ENV['DEFER_CONTRACT_MIGRATIONS'] = '1';
    $_SERVER['DEFER_CONTRACT_MIGRATIONS'] = '1';

    try {
        expect(DeferredContractMigrationGate::isDeferred())->toBeFalse();
    } finally {
        unset($_ENV['DEFER_CONTRACT_MIGRATIONS'], $_SERVER['DEFER_CONTRACT_MIGRATIONS']);
    }
});
