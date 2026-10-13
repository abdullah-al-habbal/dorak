<?php

// tests/TestCase.php
declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function authenticateDashboardActor(AdminModel|BranchModel $model): static
    {
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
        $id = (string) $model->getKey();
        $actor = $model instanceof AdminModel
            ? new DashboardActor($id, DashboardActor::ADMIN, 'platform_admin')
            : new DashboardActor($id, DashboardActor::BRANCH, 'branch_manager', $id, (string) $model->getAttribute('brand_id'));

        return $this
            ->withToken($model->createToken('dashboard-session', ['dashboard'])->plainTextToken)
            ->withHeader('X-Dashboard-Session', app(DashboardSessionClaim::class)->issue($actor));
    }
}
