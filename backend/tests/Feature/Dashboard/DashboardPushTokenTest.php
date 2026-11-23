<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Models\DeviceTokenModel;

/** Signs in through the dashboard API and returns the headers a signed-in browser sends. */
function pushSessionHeaders(mixed $test, string $actorType, string $email): array
{
    $data = $test->postJson('/api/v1/dashboard/login', ['actor_type' => $actorType, 'email' => $email, 'password' => 'password'])->assertOk()->json('data');

    return ['Authorization' => 'Bearer '.$data['token'], 'X-Dashboard-Session' => (string) $data['claim']];
}

describe('Dashboard browser push tokens', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
    });

    it('registers a web token for an admin and for a branch manager, each for their own account', function (): void {
        $admin = AdminModel::factory()->create(['email' => 'push-admin@example.test', 'password' => Hash::make('password')]);
        $branch = BranchModel::factory()->create(['email' => 'push-branch@example.test', 'password' => Hash::make('password')]);

        $this->postJson('/api/v1/dashboard/push-token', ['token' => 'admin-browser', 'locale' => 'ar'], pushSessionHeaders($this, 'admin', 'push-admin@example.test'))
            ->assertOk()->assertJsonStructure(['data' => ['id']]);
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/v1/dashboard/push-token', ['token' => 'branch-browser'], pushSessionHeaders($this, 'branch', 'push-branch@example.test'))->assertOk();

        $adminRow = DeviceTokenModel::query()->where('token', 'admin-browser')->firstOrFail();
        $branchRow = DeviceTokenModel::query()->where('token', 'branch-browser')->firstOrFail();
        expect($adminRow->user_id)->toBe($admin->id)
            ->and($adminRow->user_type)->toBe(DeviceTokenUserTypeEnum::Admin)
            ->and($adminRow->platform_type->value)->toBe('web')
            ->and($adminRow->locale)->toBe('ar')
            ->and($adminRow->access_token_id)->toBeNull()
            ->and($branchRow->user_id)->toBe($branch->id)
            ->and($branchRow->user_type)->toBe(DeviceTokenUserTypeEnum::Branch);
    });

    it('rejects a request without a dashboard session and an invalid body', function (): void {
        $this->postJson('/api/v1/dashboard/push-token', ['token' => 'anonymous'])->assertUnauthorized();
        $this->deleteJson('/api/v1/dashboard/push-token', ['token' => 'anonymous'])->assertUnauthorized();

        AdminModel::factory()->create(['email' => 'push-invalid@example.test', 'password' => Hash::make('password')]);
        $headers = pushSessionHeaders($this, 'admin', 'push-invalid@example.test');

        $this->postJson('/api/v1/dashboard/push-token', ['locale' => 'fr'], $headers)->assertUnprocessable()->assertJsonValidationErrors(['token', 'locale']);
        expect(DeviceTokenModel::query()->count())->toBe(0);
    });

    it('revokes only the caller\'s own token, treats an unknown token as done and forbids another account\'s', function (): void {
        AdminModel::factory()->create(['email' => 'push-owner@example.test', 'password' => Hash::make('password')]);
        $other = AdminModel::factory()->create();
        DeviceTokenModel::query()->create([
            'user_id' => $other->id,
            'user_type' => DeviceTokenUserTypeEnum::Admin,
            'token' => 'foreign-browser',
            'platform_type' => 'web',
            'last_used_at' => now(),
        ]);
        $headers = pushSessionHeaders($this, 'admin', 'push-owner@example.test');
        $this->postJson('/api/v1/dashboard/push-token', ['token' => 'own-browser'], $headers)->assertOk();

        $this->deleteJson('/api/v1/dashboard/push-token', ['token' => 'foreign-browser'], $headers)->assertForbidden();
        $this->deleteJson('/api/v1/dashboard/push-token', ['token' => 'never-registered'], $headers)->assertOk();
        $this->deleteJson('/api/v1/dashboard/push-token', ['token' => 'own-browser'], $headers)->assertOk();

        expect(DeviceTokenModel::query()->where('token', 'own-browser')->firstOrFail()->revoked_at)->not->toBeNull()
            ->and(DeviceTokenModel::query()->where('token', 'foreign-browser')->firstOrFail()->revoked_at)->toBeNull();
    });

    it('revokes the browser token on logout, and ignores a token that is not the caller\'s', function (): void {
        AdminModel::factory()->create(['email' => 'push-logout@example.test', 'password' => Hash::make('password')]);
        $other = AdminModel::factory()->create();
        DeviceTokenModel::query()->create([
            'user_id' => $other->id,
            'user_type' => DeviceTokenUserTypeEnum::Admin,
            'token' => 'someone-else',
            'platform_type' => 'web',
            'last_used_at' => now(),
        ]);
        $headers = pushSessionHeaders($this, 'admin', 'push-logout@example.test');
        $this->postJson('/api/v1/dashboard/push-token', ['token' => 'logout-browser'], $headers)->assertOk();

        $this->postJson('/api/v1/dashboard/logout', ['push_token' => 'logout-browser'], $headers)->assertOk();
        $this->app['auth']->forgetGuards();
        $second = pushSessionHeaders($this, 'admin', 'push-logout@example.test');
        $this->postJson('/api/v1/dashboard/logout', ['push_token' => 'someone-else'], $second)->assertOk();

        expect(DeviceTokenModel::query()->where('token', 'logout-browser')->firstOrFail()->revoked_at)->not->toBeNull()
            ->and(DeviceTokenModel::query()->where('token', 'someone-else')->firstOrFail()->revoked_at)->toBeNull();
    });
});
