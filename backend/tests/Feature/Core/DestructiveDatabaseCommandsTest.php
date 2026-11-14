<?php

declare(strict_types=1);

use Illuminate\Database\Console\Migrations\FreshCommand;
use Illuminate\Database\Console\WipeCommand;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Core\Providers\ApplicationServiceProvider;

/** Reads the framework's protected "prohibited from running" flag of a command class. */
function commandIsProhibited(string $command): bool
{
    return (bool) (fn () => static::$prohibitedFromRunning)->bindTo(null, $command)();
}

/** Safeguard: the wipe commands must refuse, leaving the schema and rows untouched. */
afterEach(fn () => DB::prohibitDestructiveCommands(false));

it('prohibits the wipe commands when the application runs in production', function (): void {
    $environment = app()['env'];
    app()->instance('env', 'production');

    try {
        (fn () => $this->prohibitDestructiveDatabaseCommands())->call(new ApplicationServiceProvider(app()));
    } finally {
        app()->instance('env', $environment);
    }
    expect(commandIsProhibited(FreshCommand::class))->toBeTrue();
    $before = DB::table('migrations')->count();

    foreach (['migrate:fresh', 'migrate:refresh', 'migrate:reset', 'db:wipe'] as $command) {
        expect(Artisan::call($command, ['--force' => true]))->toBe(1, $command);
    }

    expect(Schema::hasTable('migrations'))->toBeTrue()->and(DB::table('migrations')->count())->toBe($before);
});

it('leaves the wipe commands available outside production', function (): void {
    (fn () => $this->prohibitDestructiveDatabaseCommands())->call(new ApplicationServiceProvider(app()));

    expect(app()->isProduction())->toBeFalse()
        ->and(commandIsProhibited(FreshCommand::class))->toBeFalse()
        ->and(commandIsProhibited(WipeCommand::class))->toBeFalse();
});

it('prohibits the wipe commands for a non-local database whatever APP_ENV says', function (string $host): void {
    $original = config('database.connections.mysql.host');
    config(['database.connections.mysql.host' => $host]);

    try {
        (fn () => $this->prohibitDestructiveDatabaseCommands())->call(new ApplicationServiceProvider(app()));
    } finally {
        config(['database.connections.mysql.host' => $original]);
    }

    expect(app()->environment())->toBe('testing')->and(commandIsProhibited(FreshCommand::class))->toBeTrue();
})->with([
    'remote name' => ['db.internal.example.com'],
    'private ip' => ['10.0.0.5'],
    'lookalike' => ['127.0.0.1.evil.example'],
    'no host' => [''],
]);

it('keeps the wipe commands available for a local database outside production', function (string $host): void {
    config(['database.connections.mysql.host' => $host]);
    (fn () => $this->prohibitDestructiveDatabaseCommands())->call(new ApplicationServiceProvider(app()));

    expect(commandIsProhibited(FreshCommand::class))->toBeFalse();
})->with(['127.0.0.1', 'localhost', '::1']);
