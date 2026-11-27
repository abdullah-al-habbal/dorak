<?php

declare(strict_types=1);

use Laravel\Reverb\ConfigApplicationProvider;
use Laravel\Reverb\Connection;
use Laravel\Reverb\Contracts\WebSocketConnection;
use Laravel\Reverb\Protocols\Pusher\Exceptions\InvalidOrigin;
use Laravel\Reverb\Protocols\Pusher\Server;

/*
 * BG-51: Reverb compares only the origin's host with `allowed_origins`, and the
 * native apps send no origin at all. These tests run Reverb's own origin check
 * against the configured application.
 */
function reverbAcceptsOrigin(?string $origin): void
{
    $application = (new ConfigApplicationProvider(collect(config('reverb.apps.apps'))))->all()->first();

    $connection = new Connection(Mockery::mock(WebSocketConnection::class), $application, $origin);

    $server = (new ReflectionClass(Server::class))->newInstanceWithoutConstructor();

    (new ReflectionMethod(Server::class, 'verifyOrigin'))->invoke($server, $connection);
}

beforeEach(function (): void {
    config(['reverb.apps.apps.0.app_id' => 'test-app', 'reverb.apps.apps.0.key' => 'test-key']);
    config(['reverb.apps.apps.0.secret' => 'test-secret']);
});

it('accepts a websocket connection', function (?string $origin): void {
    expect(fn () => reverbAcceptsOrigin($origin))->not->toThrow(InvalidOrigin::class);
})->with([
    'a native app, which sends no origin' => null,
    'a local browser' => 'http://localhost:3000',
    'a hosted web build' => 'https://app.example.com',
]);
