<?php

declare(strict_types=1);

use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as RouteFacade;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;

const ADMIN_ROUTE_PREFIX = 'api/v1/dashboard/admin/';
const ADMIN_ROUTE_PLACEHOLDER_ID = '00000000-0000-4000-8000-000000000001';

/**
 * Every route the router registers under the platform-admin prefix, read from the router itself: a new admin route is
 * covered the moment it exists, so the guard cannot be forgotten the way a hand-written list can.
 *
 * @return array<string, array{0: string, 1: string}> method and URL, keyed by "METHOD uri"
 */
function adminRoutesUnderTest(): array
{
    $routes = [];
    foreach (RouteFacade::getRoutes()->getRoutes() as $route) {
        /** @var Route $route */
        if (! str_starts_with($route->uri(), ADMIN_ROUTE_PREFIX)) {
            continue;
        }
        foreach (array_diff($route->methods(), ['HEAD']) as $method) {
            $url = '/'.preg_replace('/\{[^}]+\}/', ADMIN_ROUTE_PLACEHOLDER_ID, $route->uri());
            $routes[$method.' '.$route->uri()] = [$method, $url];
        }
    }

    return $routes;
}

describe('Every admin route is platform-admin only', function (): void {
    it('registers the admin routes this test reads', function (): void {
        expect(count(adminRoutesUnderTest()))->toBeGreaterThan(80);
    });

    it('rejects an anonymous caller with 401', function (): void {
        $wrong = [];
        foreach (adminRoutesUnderTest() as $key => [$method, $url]) {
            $status = $this->json($method, $url)->getStatusCode();
            if ($status !== 401) {
                $wrong[] = "{$key} answered {$status}";
            }
        }

        expect($wrong)->toBe([]);
    });

    it('rejects an owner, a barber and a branch with 403', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $actors = [$owner, BarberModel::factory()->create(), BranchModel::factory()->create()];

        $wrong = [];
        foreach (adminRoutesUnderTest() as $key => [$method, $url]) {
            foreach ($actors as $actor) {
                $this->authenticateDashboardActor($actor);
                $status = $this->json($method, $url, [])->getStatusCode();
                if ($status !== 403) {
                    $wrong[] = "{$key} answered {$status} to ".class_basename($actor);
                }
            }
        }

        expect($wrong)->toBe([]);
    });
});
