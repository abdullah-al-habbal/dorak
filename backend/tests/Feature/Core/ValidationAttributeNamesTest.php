<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;

/*
 * BaseApiFormRequest::attributes() names translatable fields readably for every API surface. The error keys stay
 * `name.en` and friends, so clients that map errors onto fields (the dashboard, the mobile apps) keep working.
 */

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

describe('Readable validation attribute names', function (): void {
    it('names a missing English name on a dashboard request and keeps the error keys', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson('/api/v1/dashboard/admin/catalog-categories', ['name' => ['en' => '', 'ar' => '']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name.en' => 'The English name field is required.',
                'name.ar' => 'The Arabic name field is required.',
            ]);
    });

    it('names translatable fields on a mobile-facing request too', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->patchJson('/api/v1/branch/profile', ['name' => ['en' => str_repeat('a', 300)], 'address' => ['ar' => ['not text']]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name.en' => 'The English name field must not be greater than 100 characters.',
                'address.ar' => 'The Arabic address field must be a string.',
            ]);
    });

    it('leaves fields outside the map as they were', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->patchJson('/api/v1/branch/profile', ['latitude' => 200])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['latitude' => 'The latitude field must be between -90 and 90.']);
    });
});
