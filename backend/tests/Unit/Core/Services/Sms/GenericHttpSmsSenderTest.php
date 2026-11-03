<?php

declare(strict_types=1);

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Modules\Core\Enums\SmsHttpFormatEnum;
use Modules\Core\Exceptions\SmsDeliveryException;
use Modules\Core\Services\Sms\GenericHttpSmsSender;
use Modules\Core\ValuesObjects\GenericHttpSmsConfig;

function genericHttpSender(
    SmsHttpFormatEnum $format = SmsHttpFormatEnum::Json,
    array $headers = ['Authorization' => 'Bearer secret-token'],
    array $payload = ['to' => '{{phone}}', 'body' => ['text' => '{{message}}'], 'channel' => 'whatsapp'],
): GenericHttpSmsSender {
    return new GenericHttpSmsSender(new GenericHttpSmsConfig(
        url: 'https://gateway.test/send',
        format: $format,
        headers: $headers,
        payloadTemplate: $payload,
        timeoutSeconds: 5,
    ));
}

describe('GenericHttpSmsSender', function (): void {
    it('posts the templated json payload with the configured headers', function (): void {
        Http::fake(['gateway.test/*' => Http::response(['ok' => true], 200)]);

        genericHttpSender()->send('+963911222333', 'Code 123456 {{phone}}');

        Http::assertSentCount(1);
        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://gateway.test/send'
                && $request->method() === 'POST'
                && $request->hasHeader('Authorization', 'Bearer secret-token')
                && $request->isJson()
                && $request->data() === [
                    'to' => '+963911222333',
                    'body' => ['text' => 'Code 123456 {{phone}}'],
                    'channel' => 'whatsapp',
                ];
        });
    });

    it('can send the payload as a form', function (): void {
        Http::fake(['gateway.test/*' => Http::response('', 200)]);

        genericHttpSender(SmsHttpFormatEnum::Form, [], ['To' => '{{phone}}', 'Body' => '{{message}}'])
            ->send('+963911222333', 'hello');

        Http::assertSent(fn (Request $request): bool => $request->isForm()
            && $request->data() === ['To' => '+963911222333', 'Body' => 'hello']);
    });

    it('throws a delivery exception on a gateway error without leaking details', function (int $status): void {
        Http::fake(['gateway.test/*' => Http::response(['error' => 'nope'], $status)]);

        try {
            genericHttpSender()->send('+963911222333', 'Code 123456');
            $this->fail('Expected SmsDeliveryException.');
        } catch (SmsDeliveryException $exception) {
            expect($exception->getMessage())
                ->toContain((string) $status)
                ->not->toContain('+963911222333')
                ->not->toContain('123456')
                ->not->toContain('secret-token');
        }

        Http::assertSentCount(1);
    })->with([401, 422, 500, 503]);

    it('throws a delivery exception when the gateway is unreachable', function (): void {
        Http::fake(fn () => throw new ConnectionException('cURL error 28: timed out'));

        expect(fn () => genericHttpSender()->send('+963911222333', 'Code 123456'))
            ->toThrow(SmsDeliveryException::class, 'SMS gateway is unreachable.');
    });
});

describe('GenericHttpSmsConfig::fromConfig', function (): void {
    it('parses env style values and applies defaults', function (): void {
        $config = GenericHttpSmsConfig::fromConfig([
            'url' => 'https://gateway.test/send',
            'format' => 'form',
            'headers' => '{"X-Api-Key":"abc"}',
            'payload' => '',
            'timeout' => '',
        ]);

        expect($config->format)->toBe(SmsHttpFormatEnum::Form)
            ->and($config->headers)->toBe(['X-Api-Key' => 'abc'])
            ->and($config->payloadTemplate)->toBe(['to' => '{{phone}}', 'message' => '{{message}}'])
            ->and($config->timeoutSeconds)->toBe(10);
    });

    it('rejects an invalid url or malformed json', function (array $config): void {
        expect(fn () => GenericHttpSmsConfig::fromConfig($config))->toThrow(InvalidArgumentException::class);
    })->with([
        'missing url' => [['url' => null]],
        'non http url' => [['url' => 'ftp://gateway.test']],
        'bad headers json' => [['url' => 'https://gateway.test', 'headers' => '{oops']],
        'payload not an object' => [['url' => 'https://gateway.test', 'payload' => '[1,2]']],
    ]);
});
