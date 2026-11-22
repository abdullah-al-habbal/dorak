<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

/**
 * The deploy script runs on the server over SSH, so it cannot be executed here. These tests pin what can be proven
 * locally: the order of its steps (read from the real workflow file), that the script parses, and that its rollback
 * trap restores the previous release exactly when the deploy dies after the swap.
 */
function deployWorkflow(): string
{
    // The monorepo keeps workflows one level above backend/; the split backend repository keeps them at its root.
    foreach ([base_path('.github/workflows/deploy.yml'), dirname(base_path()).'/.github/workflows/deploy.yml'] as $path) {
        if (is_file($path)) {
            return (string) file_get_contents($path);
        }
    }

    throw new RuntimeException('deploy.yml not found next to or above backend/.');
}

function deployScript(): string
{
    $workflow = deployWorkflow();
    $start = strpos($workflow, "script: |\n") + strlen("script: |\n");
    $lines = array_map(fn (string $line): string => substr($line, 12), explode("\n", substr($workflow, $start)));

    return implode("\n", $lines);
}

/** The one place the script runs a migration; which command it runs is picked just above it. */
const DEPLOY_MIGRATE_INVOCATION = 'artisan $MIGRATE_CMD';

function position(string $haystack, string $needle): int
{
    $position = strpos($haystack, $needle);
    expect($position)->not->toBeFalse("Missing in deploy.yml: {$needle}");

    return (int) $position;
}

it('has a deploy script that bash can parse', function (): void {
    $file = tempnam(sys_get_temp_dir(), 'deploy-script');
    file_put_contents($file, deployScript());
    $process = new Process(['bash', '-n', $file]);
    $process->run();
    unlink($file);

    expect($process->getExitCode())->toBe(0, $process->getErrorOutput());
});

it('uses the verified Hostinger paths and explicit CLI tools with strict Git host verification', function (): void {
    $workflow = deployWorkflow();

    expect($workflow)->toContain('/home/u685718414/domains/dev-dorak-backend.io/public_html/dev')
        ->toContain('/home/u685718414/domains/dev-dorak-backend.io/shared')
        ->toContain('PHP_BIN="/opt/alt/php85/usr/bin/php"')
        ->toContain('COMPOSER_BIN="${DORAK_COMPOSER_BIN}"')
        ->toContain('DORAK_COMPOSER_BIN: composer2')
        ->toContain('$COMPOSER_BIN install $COMPOSER_FLAGS')
        ->toContain('git sparse-checkout set backend')
        ->toContain('ACTUAL_SHA="$(git rev-parse HEAD)"')
        ->toContain('StrictHostKeyChecking=yes')
        ->not->toContain('if: ${{ false }}');
});

it('runs one migration pass before replacing the release, then health-checks it and restarts workers', function (): void {
    $script = deployScript();

    expect(substr_count($script, DEPLOY_MIGRATE_INVOCATION))->toBe(1);

    $migrate = position($script, DEPLOY_MIGRATE_INVOCATION);
    $swap = position($script, 'mv "$RELEASE_DIR" "$CURRENT_DIR"');
    $health = position($script, 'run_health_check "after the swap"');
    $workers = position($script, 'artisan queue:restart');
    $committed = position($script, 'Deployment is now committed');

    expect($migrate)->toBeLessThan($swap)
        ->and($swap)->toBeLessThan($health)
        ->and($health)->toBeLessThan($workers)
        ->and($workers)->toBeLessThan($committed);
});

it('picks plain migrate by default and migrate:fresh --seed only for a guarded development reset', function (): void {
    $script = deployScript();

    expect(substr_count($script, 'MIGRATE_CMD="migrate --force"'))->toBe(1)
        ->and(substr_count($script, 'MIGRATE_CMD="migrate:fresh --seed --force"'))->toBe(1);

    $reset = position($script, 'if [ "$RESET_DATABASE" = "true" ]; then');
    $guard = position($script, 'if [ "$ENVIRONMENT" != "development" ]; then');
    $fresh = position($script, 'MIGRATE_CMD="migrate:fresh --seed --force"');
    $plain = position($script, 'MIGRATE_CMD="migrate --force"');

    expect($reset)->toBeLessThan($guard)
        ->and($guard)->toBeLessThan($fresh)
        ->and($fresh)->toBeLessThan($plain)
        ->and($plain)->toBeLessThan(position($script, DEPLOY_MIGRATE_INVOCATION));
});

it('keeps no deferred contract migration machinery or maintenance mode in the deploy', function (): void {
    $script = deployScript();

    expect($script)->not->toContain('DEFER_CONTRACT_MIGRATIONS')
        ->and($script)->not->toContain('artisan down')
        ->and($script)->not->toContain('job-applications:');
});

it('arms the rollback trap before the first migration and disarms it only after the health check', function (): void {
    $script = deployScript();

    expect(position($script, 'trap cleanup_failed_release EXIT'))->toBeLessThan(position($script, DEPLOY_MIGRATE_INVOCATION));
    $committed = position($script, 'Deployment is now committed');
    expect(strpos($script, "HAD_PREVIOUS_RELEASE=false\n", $committed))->not->toBeFalse()
        ->and(strpos($script, "RELEASE_IS_LIVE=false\n", $committed))->not->toBeFalse()
        ->and($committed)->toBeGreaterThan(position($script, 'run_health_check "after the swap"'));
    expect(position($script, 'MIGRATIONS_APPLIED=true'))->toBeLessThan(position($script, 'mv "$RELEASE_DIR" "$CURRENT_DIR"'));
});

/** Runs the real cleanup function from deploy.yml against throw-away directories. */
function runDeployTrap(bool $liveAndFailing, bool $hadPrevious = true): array
{
    $script = deployScript();
    $start = position($script, 'cleanup_failed_release() {');
    $end = position($script, 'trap cleanup_failed_release EXIT');
    $function = substr($script, $start, $end - $start);

    $root = sys_get_temp_dir().'/deploy-trap-'.bin2hex(random_bytes(4));
    mkdir($root.'/current', 0o777, true);
    file_put_contents($root.'/current/VERSION', 'new');
    if ($hadPrevious) {
        mkdir($root.'/old_tmp', 0o777, true);
        file_put_contents($root.'/old_tmp/VERSION', 'old');
    }

    $driver = implode("\n", [
        'set -Eeuo pipefail',
        'CURRENT_DIR='.escapeshellarg($root.'/current'),
        'OLD_TMP_DIR='.escapeshellarg($root.'/old_tmp'),
        'RELEASE_DIR='.escapeshellarg($root.'/release_missing'),
        'HAD_PREVIOUS_RELEASE='.($liveAndFailing && $hadPrevious ? 'true' : 'false'),
        'RELEASE_IS_LIVE='.($liveAndFailing ? 'true' : 'false'),
        'MIGRATIONS_APPLIED=true',
        $function,
        'trap cleanup_failed_release EXIT',
        $liveAndFailing ? 'false' : 'exit 0',
    ]);
    $process = new Process(['bash', '-c', $driver]);
    $process->run();

    $version = is_file($root.'/current/VERSION') ? file_get_contents($root.'/current/VERSION') : null;
    exec('rm -rf '.escapeshellarg($root));

    return ['exit' => $process->getExitCode(), 'version' => $version, 'output' => $process->getOutput().$process->getErrorOutput()];
}

it('restores the previous release and warns that the schema stays migrated when the deploy fails after the swap', function (): void {
    $result = runDeployTrap(liveAndFailing: true);

    expect($result['exit'])->not->toBe(0)
        ->and($result['version'])->toBe('old')
        ->and($result['output'])->toContain('restoring previous release')
        ->and($result['output'])->toContain('DATABASE MIGRATIONS RAN AND ARE NOT ROLLED BACK');
});

it('removes a failed first-ever release instead of leaving it serving', function (): void {
    $result = runDeployTrap(liveAndFailing: true, hadPrevious: false);

    expect($result['exit'])->not->toBe(0)->and($result['version'])->toBeNull();
});

it('leaves the new release alone once the deployment is committed and disarmed', function (): void {
    $result = runDeployTrap(liveAndFailing: false);

    expect($result['exit'])->toBe(0)->and($result['version'])->toBe('new');
});
