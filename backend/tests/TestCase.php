<?php

// tests/TestCase.php
declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use LogicException;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
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

    /**
     * Runs before any trait set-up, so before RefreshDatabase's migrate:fresh, and refuses any database but
     * MySQL `dorak_test`. Overriding setUpTraits keeps the guard in force even when a test file re-applies a trait.
     *
     * @return array<class-string, class-string>
     */
    protected function setUpTraits()
    {
        TestDatabaseGuard::assertSafe(
            (string) app()->environment(),
            DB::connection()->getDriverName(),
            DB::connection()->getDatabaseName(),
        );

        return parent::setUpTraits();
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

        return $this
            ->withToken($model->createToken('dashboard-session', ['dashboard'])->plainTextToken)
            ->withHeader('X-Dashboard-Session', app(DashboardSessionClaim::class)->issue($actor));
    }
}
