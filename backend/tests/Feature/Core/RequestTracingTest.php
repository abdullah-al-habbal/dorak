<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Modules\Core\Logging\StructuredJsonFormatter;
use Monolog\Level;
use Monolog\LogRecord;

it('echoes a valid request id and includes it in api errors', function () {
    $uuid = Str::uuid()->toString();

    $response = $this->withHeader('X-Request-ID', $uuid)->getJson('/api/v1/__request-tracing-missing');

    $response->assertNotFound()
        ->assertHeader('X-Request-ID', $uuid)
        ->assertJsonPath('request_id', $uuid)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'RESOURCE_NOT_FOUND');
});

it('replaces invalid request ids with generated uuids', function () {
    $response = $this->withHeader('X-Request-ID', 'not-a-uuid')->getJson('/api/v1/__request-tracing-missing');

    $response->assertNotFound();
    expect(Str::isUuid((string) $response->headers->get('X-Request-ID')))->toBeTrue();
    expect($response->json('request_id'))->toBe($response->headers->get('X-Request-ID'));
});

it('renders unhandled api exceptions with a safe message and a request id', function () {
    Route::get('/api/v1/__request-tracing-failure', function () {
        throw new RuntimeException('sensitive implementation detail');
    });

    $response = $this->getJson('/api/v1/__request-tracing-failure');

    $response->assertInternalServerError()
        ->assertHeader('X-Request-ID')
        ->assertJsonPath('code', 'SERVER_ERROR')
        ->assertJsonMissing(['message' => 'sensitive implementation detail']);
});

it('formats records using the central schema and redacts secret context', function () {
    $formatter = new StructuredJsonFormatter;
    $record = new LogRecord(
        new DateTimeImmutable('2026-10-14T10:00:00+00:00'),
        'testing',
        Level::Warning,
        'Sensitive payload received',
        ['uuid' => 'request-id', 'password' => 'plaintext', 'nested' => ['api_key' => 'secret']],
    );

    $decoded = json_decode($formatter->format($record), true, flags: JSON_THROW_ON_ERROR);

    expect(array_keys($decoded))->toBe(['timestamp', 'level', 'uuid', 'module', 'file', 'line', 'message', 'context'])
        ->and($decoded['uuid'])->toBe('request-id')
        ->and($decoded['level'])->toBe('warning')
        ->and($decoded['context']['password'])->toBe('[REDACTED]')
        ->and($decoded['context']['nested']['api_key'])->toBe('[REDACTED]');
});
