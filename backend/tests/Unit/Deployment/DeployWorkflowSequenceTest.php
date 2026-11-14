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

it('runs exactly two migrate passes: deferred before the swap, plain in maintenance mode after the first health check', function (): void {
    $script = deployScript();

    expect(substr_count($script, 'artisan migrate --force'))->toBe(2);

    $pre = position($script, 'DEFER_CONTRACT_MIGRATIONS=1 flock');
    $swap = position($script, 'mv "$RELEASE_DIR" "$CURRENT_DIR"');
    $health = position($script, 'run_health_check "before the contract migrations"');
    $down = position($script, 'artisan down --retry=60');
    $workers = position($script, 'artisan queue:restart');
    $drain = position($script, 'sleep "$DRAIN_SECONDS"');
    $post = position($script, 'env -u DEFER_CONTRACT_MIGRATIONS flock');
    $verify = position($script, 'artisan job-applications:verify-unique-index');
    $pending = position($script, 'artisan migrate:status --pending');
    $up = position($script, 'artisan up');
    $healthAfter = position($script, 'run_health_check "after the unique index"');
    $committed = position($script, 'Deployment is now committed');

    expect($pre)->toBeLessThan($swap)
        ->and($swap)->toBeLessThan($health)
        ->and($health)->toBeLessThan($down)
        ->and($down)->toBeLessThan($workers)
        ->and($workers)->toBeLessThan($drain)
        ->and($drain)->toBeLessThan($post)
        ->and($post)->toBeLessThan($verify)
        ->and($verify)->toBeLessThan($pending)
        ->and($pending)->toBeLessThan($up)
        ->and($up)->toBeLessThan($healthAfter)
        ->and($healthAfter)->toBeLessThan($committed);
    // The deferral variable is set only inline on the pre-swap command, never exported for the rest of the script.
    expect(substr_count($script, 'DEFER_CONTRACT_MIGRATIONS=1 flock'))->toBe(1)
        ->and($script)->not->toContain('export DEFER_CONTRACT_MIGRATIONS');
});

it('marks maintenance mode before it starts it, so the trap always lifts it, and lifts it only after the contract step', function (): void {
    $script = deployScript();

    expect(position($script, 'MAINTENANCE_ON=true'))->toBeLessThan(position($script, 'artisan down --retry=60'))
        ->and(strpos($script, "MAINTENANCE_ON=false\n", position($script, 'artisan up')))->not->toBeFalse();
    expect($script)->toContain('rm -f -- "$SHARED_DIR/storage/framework/down"');
});

it('arms the rollback trap before the first migration and disarms it only after the deferred migrations are verified', function (): void {
    $script = deployScript();

    expect(position($script, 'trap cleanup_failed_release EXIT'))->toBeLessThan(position($script, 'DEFER_CONTRACT_MIGRATIONS=1 flock'));
    // The disarming assignments sit after the "committed" comment, which itself follows the verification.
    $committed = position($script, 'Deployment is now committed');
    expect(strpos($script, "HAD_PREVIOUS_RELEASE=false\n", $committed))->not->toBeFalse()
        ->and(strpos($script, "RELEASE_IS_LIVE=false\n", $committed))->not->toBeFalse()
        ->and($committed)->toBeGreaterThan(position($script, 'artisan migrate:status --pending'));
    expect(position($script, 'MIGRATIONS_APPLIED=true'))->toBeLessThan(position($script, 'mv "$RELEASE_DIR" "$CURRENT_DIR"'));
});

it('fails the deploy when the deferred pass or its verification fails', function (): void {
    $script = deployScript();

    expect($script)->toContain('exit "$DEFERRED_RC"')
        ->and($script)->toContain('Migrations are still pending after the deferred run');
});

/** Runs the real cleanup function from deploy.yml against throw-away directories. */
function runDeployTrap(bool $liveAndFailing, bool $hadPrevious = true, bool $maintenance = false): array
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

    if ($maintenance) {
        mkdir($root.'/shared/storage/framework', 0o777, true);
        file_put_contents($root.'/shared/storage/framework/down', '{}');
    }

    $driver = implode("\n", [
        'set -Eeuo pipefail',
        'CURRENT_DIR='.escapeshellarg($root.'/current'),
        'OLD_TMP_DIR='.escapeshellarg($root.'/old_tmp'),
        'RELEASE_DIR='.escapeshellarg($root.'/release_missing'),
        'HAD_PREVIOUS_RELEASE='.($liveAndFailing && $hadPrevious ? 'true' : 'false'),
        'RELEASE_IS_LIVE='.($liveAndFailing ? 'true' : 'false'),
        'MIGRATIONS_APPLIED=true',
        'SHARED_DIR='.escapeshellarg($root.'/shared'),
        'MAINTENANCE_ON='.($maintenance ? 'true' : 'false'),
        'INDEX_MAY_EXIST='.($maintenance ? 'true' : 'false'),
        $function,
        'trap cleanup_failed_release EXIT',
        $liveAndFailing ? 'false' : 'exit 0',
    ]);
    $process = new Process(['bash', '-c', $driver]);
    $process->run();

    $version = is_file($root.'/current/VERSION') ? file_get_contents($root.'/current/VERSION') : null;
    exec('rm -rf '.escapeshellarg($root));

    $maintenanceLifted = ! is_file($root.'/shared/storage/framework/down');

    return ['exit' => $process->getExitCode(), 'version' => $version, 'maintenanceLifted' => $maintenanceLifted, 'output' => $process->getOutput().$process->getErrorOutput()];
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

it('lifts maintenance mode and warns about the unique index when the deploy fails during the contract step', function (): void {
    $result = runDeployTrap(liveAndFailing: true, maintenance: true);

    expect($result['exit'])->not->toBe(0)
        ->and($result['version'])->toBe('old')
        ->and($result['maintenanceLifted'])->toBeTrue()
        ->and($result['output'])->toContain('unique job application index may exist');
});
