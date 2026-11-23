<?php

declare(strict_types=1);

use Modules\Core\Exceptions\UnsafeDeliveryConfigurationException;
use Modules\Core\Services\ProductionDeliveryGuard;
use Symfony\Component\Process\Process;

function guardIn(string $environment, ?string $sms, ?string $mailer): ProductionDeliveryGuard
{
    app()->detectEnvironment(fn (): string => $environment);
    config(['services.sms.driver' => $sms, 'mail.default' => $mailer]);

    return app(ProductionDeliveryGuard::class);
}

afterEach(fn () => app()->detectEnvironment(fn (): string => 'testing'));

it('refuses the log SMS driver in production', function (): void {
    expect(fn () => guardIn('production', 'log', 'smtp')->assertSafe())
        ->toThrow(UnsafeDeliveryConfigurationException::class, 'SMS_DRIVER');
});

it('refuses the log and array mailers in production', function (string $mailer): void {
    expect(fn () => guardIn('production', 'generic_http', $mailer)->assertSafe())
        ->toThrow(UnsafeDeliveryConfigurationException::class, 'MAIL_MAILER');
})->with(['log', 'array']);

it('names every unsafe driver in one message', function (): void {
    expect(fn () => guardIn('production', 'log', 'log')->assertSafe())
        ->toThrow(UnsafeDeliveryConfigurationException::class, 'SMS_DRIVER is "log"; use a real gateway such as "generic_http"; MAIL_MAILER is "log"');
});

it('accepts real drivers in production', function (): void {
    expect(function (): void {
        guardIn('production', 'generic_http', 'smtp')->assertSafe();
    })->not->toThrow(Throwable::class);
});

it('does not trip on unset drivers, which an image build has', function (): void {
    expect(function (): void {
        guardIn('production', null, null)->assertSafe();
    })->not->toThrow(Throwable::class);
});

it('allows the log drivers outside production', function (string $environment): void {
    expect(function (): void {
        guardIn($environment, 'log', 'log')->assertSafe();
    })->not->toThrow(Throwable::class);
})->with(['local', 'testing', 'staging']);

it('is wired into boot: the application does not start in production with log drivers', function (): void {
    $run = function (string $sms, string $mailer): Process {
        $process = new Process([PHP_BINARY, 'artisan', 'list', '--format=json'], base_path(), [
            'APP_ENV' => 'production',
            'SMS_DRIVER' => $sms,
            'MAIL_MAILER' => $mailer,
        ]);
        $process->run();

        return $process;
    };

    $unsafe = $run('log', 'log');
    expect($unsafe->getExitCode())->not->toBe(0)
        ->and($unsafe->getOutput().$unsafe->getErrorOutput())->toContain('Refusing to boot in production');

    $safe = $run('generic_http', 'smtp');
    expect($safe->getExitCode())->toBe(0, $safe->getErrorOutput());
});
