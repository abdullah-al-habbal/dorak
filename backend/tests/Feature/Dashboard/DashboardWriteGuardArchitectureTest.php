<?php

declare(strict_types=1);

use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as RouteFacade;
use Modules\Dashboard\Http\Actions\Services\ListServicesAction;
use Modules\Dashboard\Http\Middleware\DashboardAdminAuthorizationMiddleware;
use Modules\Dashboard\Http\Middleware\DashboardAuthorizationMiddleware;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardWriteExemptions;
use Modules\Dashboard\Support\ScopedBranchResolver;

const DASHBOARD_READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Tenant-reachable dashboard write actions: non-GET, behind the dashboard session middleware and not
 * platform-admin only (the guard bypasses admins by design). Public and sign-in routes have no session
 * middleware and are not tenant writes.
 *
 * @return list<class-string>
 */
function tenantDashboardWriteActions(): array
{
    $actions = [];
    foreach (RouteFacade::getRoutes()->getRoutes() as $route) {
        /** @var Route $route */
        if (! str_starts_with($route->uri(), 'api/v1/dashboard')) {
            continue;
        }
        if (array_diff($route->methods(), DASHBOARD_READ_METHODS) === []) {
            continue;
        }
        $middleware = $route->gatherMiddleware();
        if (! in_array(DashboardAuthorizationMiddleware::class, $middleware, true)
            || in_array(DashboardAdminAuthorizationMiddleware::class, $middleware, true)) {
            continue;
        }
        $actions[] = ltrim(explode('@', $route->getActionName())[0], '\\');
    }

    return array_values(array_unique($actions));
}

function actionCallsWriteGuard(string $class): bool
{
    $source = (string) file_get_contents((new ReflectionClass($class))->getFileName());

    return str_contains($source, DashboardWriteGuard::class) || str_contains($source, 'resolveForWrite(');
}

/**
 * @param  list<class-string>  $actions
 * @return list<class-string>
 */
function unreviewedWriteActions(array $actions): array
{
    $reviewed = [...DashboardWriteExemptions::SELF_ACCOUNT, ...DashboardWriteExemptions::ALLOWED_WHEN_SUSPENDED, ...array_keys(DashboardWriteExemptions::PENDING)];

    return array_values(array_filter($actions, fn (string $class): bool => ! in_array($class, $reviewed, true) && ! actionCallsWriteGuard($class)));
}

it('finds the dashboard write routes it is meant to police', function (): void {
    expect(tenantDashboardWriteActions())->toContain('Modules\Dashboard\Http\Actions\Services\StoreServiceAction')
        ->and(count(tenantDashboardWriteActions()))->toBeGreaterThan(40);
});

it('flags an action that neither calls the guard nor is on the reviewed list, and accepts one that does', function (): void {
    $unreviewed = ListServicesAction::class;

    expect(actionCallsWriteGuard($unreviewed))->toBeFalse()
        ->and(unreviewedWriteActions([$unreviewed]))->toBe([$unreviewed])
        ->and(actionCallsWriteGuard(ScopedBranchResolver::class))->toBeTrue()
        ->and(unreviewedWriteActions([ScopedBranchResolver::class]))->toBe([]);
});

it('has every non-GET tenant dashboard action guarded or on the reviewed exemption list', function (): void {
    expect(unreviewedWriteActions(tenantDashboardWriteActions()))->toBe([]);
});

it('keeps the exemption list honest: routed, not guarded, one entry per action', function (): void {
    $routed = tenantDashboardWriteActions();
    $self = [...DashboardWriteExemptions::SELF_ACCOUNT, ...DashboardWriteExemptions::ALLOWED_WHEN_SUSPENDED];
    $pending = array_keys(DashboardWriteExemptions::PENDING);

    expect(array_intersect($self, $pending))->toBe([]);
    foreach ([...$self, ...$pending] as $class) {
        expect($routed)->toContain($class);
        expect(actionCallsWriteGuard($class))->toBeFalse($class.' calls the guard now: remove it from the exemption list');
    }
    foreach (DashboardWriteExemptions::PENDING as $class => $slice) {
        expect($slice)->toMatch('/^S\d+[a-z]?$/', $class);
    }
});
