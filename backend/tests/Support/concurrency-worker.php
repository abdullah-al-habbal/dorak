<?php

declare(strict_types=1);

/**
 * Child process of the two-connection concurrency tests (tests/Concurrency): boots the application as its own
 * PHP process with its own database connection, refuses to run unless the connection passes
 * Tests\Support\TestDatabaseGuard, sends one JSON request through the HTTP kernel and prints
 * {"status": <int>, "body": <decoded JSON>} to stdout. It writes READY to stderr once booted, just before the request,
 * so a test can tell "still starting" from "waiting on a lock".
 *
 * Usage: php tests/Support/concurrency-worker.php <METHOD> <uri> <bearer-token> [json-body]
 */

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Tests\Support\TestDatabaseGuard;

require __DIR__.'/../../vendor/autoload.php';

[, $method, $uri, $token] = $argv;
$body = $argv[4] ?? '';

$app = require __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

TestDatabaseGuard::assertSafe((string) $app->environment(), $app->make('db')->connection()->getConfig());
TestDatabaseGuard::assertServer(
    fn (): string => (string) $app->make('db')->selectOne('select version() as version')->version,
    $app->make('db')->connection()->getConfig(),
);

$request = Request::create($uri, $method, [], [], [], [
    'HTTP_ACCEPT' => 'application/json',
    'HTTP_AUTHORIZATION' => 'Bearer '.$token,
    'CONTENT_TYPE' => 'application/json',
], $body);
fwrite(STDERR, "READY\n");
$response = $kernel->handle($request);

fwrite(STDOUT, json_encode(['status' => $response->getStatusCode(), 'body' => json_decode((string) $response->getContent(), true)], JSON_THROW_ON_ERROR));
