<?php

// tests/TestCase.php
declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use LogicException;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Constants\BookingConstants;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Tests\Support\TestDatabaseGuard;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /** Set by a test that asserts the missing-key behaviour. */
    protected bool $omitBookingIdempotencyKey = false;

    /**
     * Runs before any trait set-up, so before RefreshDatabase's migrate:fresh, and refuses any connection but
     * the local MySQL `dorak_test`. Overriding setUpTraits keeps the guard in force even when a test file re-applies a trait.
     *
     * @return array<class-string, class-string>
     */
    protected function setUpTraits()
    {
        $this->assertTestDatabaseIsSafe();

        return parent::setUpTraits();
    }

    /**
     * Laravel creates per-worker databases right after the app boots, before setUpTraits. Guarding here stops
     * a `--parallel` run before it can create anything.
     */
    protected function refreshApplication(): void
    {
        parent::refreshApplication();
        $this->assertTestDatabaseIsSafe();
    }

    private function assertTestDatabaseIsSafe(): void
    {
        TestDatabaseGuard::assertSafe(
            (string) app()->environment(),
            DB::connection()->getConfig(),
        );
        TestDatabaseGuard::assertServer(
            fn (): string => (string) DB::selectOne('select version() as version')->version,
            DB::connection()->getConfig(),
        );
    }

    /**
     * `POST /bookings` requires an `Idempotency-Key`. Tests that are not about the key get a fresh one per request;
     * a test that sends its own header, or asserts the key is missing, controls it through `withHeaders`.
     *
     * @param  string  $method
     * @param  string  $uri
     * @param  array<string, mixed>  $data
     * @param  array<string, string>  $headers
     * @param  int  $options
     */
    public function json($method, $uri, array $data = [], array $headers = [], $options = 0)
    {
        $header = BookingConstants::BOOKING_IDEMPOTENCY_HEADER;
        $sent = array_change_key_case(array_merge($this->defaultHeaders, $headers), CASE_LOWER);
        if (strtoupper((string) $method) === 'POST' && str_ends_with((string) parse_url((string) $uri, PHP_URL_PATH), '/api/v1/bookings')
            && ! array_key_exists(strtolower($header), $sent) && ! ($this->omitBookingIdempotencyKey ?? false)) {
            $headers[$header] = (string) Str::uuid();
        }

        return parent::json($method, $uri, $data, $headers, $options);
    }

    protected function authenticateDashboardActor(AdminModel|BarberModel|BranchModel|ClientModel $model): static
    {
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
        $id = (string) $model->getKey();
        $actor = match (true) {
            $model instanceof AdminModel => new DashboardActor($id, DashboardActorTypeEnum::Admin, 'platform_admin'),
            $model instanceof ClientModel => app(DashboardOwnerActorResolver::class)->forClient($model)
                ?? throw new LogicException('The client owns no brand.'),
            $model instanceof BarberModel => new DashboardActor($id, DashboardActorTypeEnum::Barber, 'barber'),
            default => new DashboardActor($id, DashboardActorTypeEnum::Branch, 'branch_manager', $id, (string) $model->getAttribute('brand_id')),
        };

        // The access token first, then the claim bound to its id (`tid`), exactly as DashboardSessionIssuer does.
        $access = $model->createToken('dashboard-session', ['dashboard']);
        // A guard keeps the user of the previous request; its token no longer matches the new claim (`tid`), so each call starts clean.
        $this->app['auth']->forgetGuards();

        return $this
            ->withToken($access->plainTextToken)
            ->withHeader('X-Dashboard-Session', app(DashboardSessionClaim::class)->issue($actor, $access->accessToken->getKey()));
    }
}
