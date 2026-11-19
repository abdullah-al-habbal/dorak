<?php

declare(strict_types=1);

/**
 * Child process of the two-connection concurrency tests (tests/Concurrency): boots the application as its own
 * PHP process with its own database connection, refuses to run unless the connection passes
 * Tests\Support\TestDatabaseGuard, sends one JSON request through the HTTP kernel and prints
 * {"status": <int>, "body": <decoded JSON>} to stdout. It writes READY to stderr once booted, just before the request,
 * so a test can tell "still starting" from "waiting on a lock".
 *
 * Usage: php tests/Support/concurrency-worker.php <METHOD> <uri> <bearer-token> [json-body] [json-headers]
 */

use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Tests\Support\TestDatabaseGuard;

require __DIR__.'/../../vendor/autoload.php';

[, $method, $uri, $token] = $argv;
$body = $argv[4] ?? '';
$extraHeaders = ($argv[5] ?? '') === '' ? [] : json_decode($argv[5], true, 512, JSON_THROW_ON_ERROR);

$app = require __DIR__.'/../../bootstrap/app.php';
// Print every reported exception to stderr, so a test can tell a lock timeout or deadlock from other 500s.
$app->extend(ExceptionHandler::class, fn (ExceptionHandler $inner): ExceptionHandler => new class($inner) implements ExceptionHandler
{
    public function __construct(private readonly ExceptionHandler $inner) {}

    public function report(Throwable $e): void
    {
        fwrite(STDERR, 'EXCEPTION '.$e::class.': '.$e->getMessage()."\n");
        $this->inner->report($e);
    }

    public function shouldReport(Throwable $e): bool
    {
        return $this->inner->shouldReport($e);
    }

    public function render($request, Throwable $e)
    {
        return $this->inner->render($request, $e);
    }

    public function renderForConsole($output, Throwable $e): void
    {
        $this->inner->renderForConsole($output, $e);
    }
});
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

TestDatabaseGuard::assertSafe((string) $app->environment(), $app->make('db')->connection()->getConfig());
TestDatabaseGuard::assertServer(
    fn (): string => (string) $app->make('db')->selectOne('select version() as version')->version,
    $app->make('db')->connection()->getConfig(),
);

$server = [
    'HTTP_ACCEPT' => 'application/json',
    'HTTP_AUTHORIZATION' => 'Bearer '.$token,
    'CONTENT_TYPE' => 'application/json',
];
foreach ($extraHeaders as $name => $value) {
    $server['HTTP_'.strtoupper(str_replace('-', '_', $name))] = $value;
}
$request = Request::create($uri, $method, [], [], [], $server, $body);
fwrite(STDERR, "READY\n");
$response = $kernel->handle($request);

fwrite(STDOUT, json_encode(['status' => $response->getStatusCode(), 'body' => json_decode((string) $response->getContent(), true)], JSON_THROW_ON_ERROR));
