<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Admin\Services\AdminUserService;
use Modules\Branch\Models\BranchModel;

/** NS-04 follow-up: a deactivated admin's token must stop working on the legacy `/admin/*` routes, not only on the dashboard. */
it('rejects a deactivated admin token on the legacy admin routes', function () {
    $victim = AdminModel::factory()->create();
    $token = $victim->createToken('legacy')->plainTextToken;
    $branch = BranchModel::factory()->create();

    $actingAdmin = AdminModel::factory()->create();
    app(AdminUserService::class)->deactivate((string) $victim->getKey(), (string) $actingAdmin->getKey());
    $this->app->get('auth')->forgetGuards();

    $this->withToken($token)
        ->postJson("/api/v1/admin/branches/{$branch->id}/deactivate")
        ->assertUnauthorized();
    $this->withToken($token)
        ->getJson("/api/v1/admin/audit/branch/{$branch->id}")
        ->assertUnauthorized();
});
