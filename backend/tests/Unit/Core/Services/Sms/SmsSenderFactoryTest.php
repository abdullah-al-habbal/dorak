<?php

declare(strict_types=1);

use Modules\Core\Contracts\SmsSender;
use Modules\Core\Services\Sms\GenericHttpSmsSender;
use Modules\Core\Services\Sms\LogSmsSender;

describe('SmsSender resolution', function (): void {
    it('resolves the log driver', function (): void {
        config(['services.sms.driver' => 'log']);

        expect(app(SmsSender::class))->toBeInstanceOf(LogSmsSender::class);
    });

    it('resolves the generic http driver from configuration', function (): void {
        config([
            'services.sms.driver' => 'generic_http',
            'services.sms.http' => ['url' => 'https://gateway.test/send'],
        ]);

        expect(app(SmsSender::class))->toBeInstanceOf(GenericHttpSmsSender::class);
    });

    it('fails fast on an unknown driver', function (): void {
        config(['services.sms.driver' => 'carrier_pigeon']);

        expect(fn () => app(SmsSender::class))->toThrow(InvalidArgumentException::class, 'Unsupported SMS driver.');
    });

    it('fails fast when the generic http driver has no url', function (): void {
        config(['services.sms.driver' => 'generic_http', 'services.sms.http' => ['url' => null]]);

        expect(fn () => app(SmsSender::class))->toThrow(InvalidArgumentException::class);
    });
});
