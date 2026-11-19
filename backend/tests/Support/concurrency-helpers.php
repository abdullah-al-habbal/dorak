<?php

declare(strict_types=1);

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;

/**
 * Shared by the tests in tests/Concurrency: commit the fixtures, run requests as their own PHP processes with their
 * own database session (tests/Support/concurrency-worker.php), and prove a request is parked on a row lock.
 * Required with `require_once dirname(__DIR__).'/Support/concurrency-helpers.php'`.
 */
function concurrencyCommitFixtures(): void
{
    // DDL ends the harness transaction on the server while Laravel's counter still says "open": just reset the counter.
    if (! DB::connection()->getPdo()->inTransaction()) {
        DB::rollBack(0);

        return;
    }

    while (DB::transactionLevel() > 0) {
        DB::commit();
    }
}

function concurrencyLocker(): Connection
{
    return DB::connectUsing('concurrency_locker', config('database.connections.mysql'), true);
}

/**
 * @param  array<string, mixed>  $body
 * @param  array<string, string>  $headers  extra request headers, for example the dashboard session claim
 * @param  array<string, string>  $env  extra environment for the worker process
 */
function concurrencyStart(string $method, string $uri, string $token, array $body = [], array $headers = [], array $env = []): Process
{
    $process = new Process(
        [PHP_BINARY, base_path('tests/Support/concurrency-worker.php'), $method, $uri, $token, $body === [] ? '' : json_encode($body, JSON_THROW_ON_ERROR), $headers === [] ? '' : json_encode($headers, JSON_THROW_ON_ERROR)],
        base_path(),
        ['APP_ENV' => 'testing', 'DB_CONNECTION' => 'mysql', 'DB_DATABASE' => DB::connection()->getDatabaseName(), 'DB_URL' => '', ...$env],
    );
    $process->setTimeout(60);
    $process->start();

    return $process;
}

/** @return array{status: int, body: array<string, mixed>|null, stderr: string} */
function concurrencyFinish(Process $process): array
{
    $process->wait();
    $decoded = json_decode($process->getOutput(), true);

    expect($decoded)->toBeArray(sprintf("worker exit %s\n%s\n%s", $process->getExitCode(), $process->getOutput(), $process->getErrorOutput()));

    return $decoded + ['stderr' => trim(str_replace("READY\n", '', $process->getErrorOutput()))];
}

/**
 * Other sessions currently executing a `FOR UPDATE` statement, read from the engine's process list. A point lookup
 * that is not blocked finishes in about a millisecond, so a session still executing one after a pause is waiting on
 * a lock. (The process list is the one signal that needs no extra privilege on MySQL 8.4.)
 */
function concurrencyBlockedStatements(): int
{
    return (int) DB::selectOne(
        "select count(*) as blocked from information_schema.processlist where id <> connection_id() and command in ('Query', 'Execute') and lower(info) like '%for update%'",
    )->blocked;
}

/** True when a statement was executing and is still executing 300 ms later: far longer than an unblocked lookup takes. */
function concurrencyStillBlocked(): bool
{
    if (concurrencyBlockedStatements() === 0) {
        return false;
    }
    usleep(300_000);

    return concurrencyBlockedStatements() > 0;
}

/** Waits for the engine to report a transaction waiting on a lock, then proves the request is that waiter and still running. */
function concurrencyAwaitBlocked(Process $process): void
{
    $deadline = microtime(true) + 30;
    while (! concurrencyStillBlocked()) {
        if (! $process->isRunning()) {
            throw new RuntimeException('The request finished without waiting on the lock held by another session: it does not lock the row. Output: '.$process->getOutput().$process->getErrorOutput());
        }
        if (microtime(true) > $deadline) {
            throw new RuntimeException('No transaction ever waited on the lock. Output: '.$process->getOutput().$process->getErrorOutput());
        }
        usleep(20_000);
    }

    expect($process->isRunning())->toBeTrue('The request must still be parked on the lock.');
}

/** @return list<int> */
function concurrencyStatuses(array $results): array
{
    $codes = array_column($results, 'status');
    sort($codes);

    return $codes;
}
