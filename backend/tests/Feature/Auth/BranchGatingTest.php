<?php

declare(strict_types=1);

use Laravel\Sanctum\Sanctum;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;

function gatedBranch(BranchStatusEnum $status): BranchModel
{
    return BranchModel::factory()->create(['status' => $status]);
}

dataset('branch gated endpoints', [
    'dashboard' => ['getJson', '/api/v1/branch/dashboard'],
    'profile' => ['getJson', '/api/v1/branch/profile'],
    'bookings' => ['getJson', '/api/v1/branch/bookings'],
    'settings' => ['getJson', '/api/v1/branch/settings'],
    'refresh' => ['postJson', '/api/v1/branch/refresh-token'],
    'notifications' => ['getJson', '/api/v1/notifications'],
]);

it('blocks a deactivated branch with 403 on every gated endpoint', function (string $method, string $uri): void {
    Sanctum::actingAs(gatedBranch(BranchStatusEnum::Disabled), ['*'], 'branch_api');

    $this->{$method}($uri)->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
})->with('branch gated endpoints');

it('blocks a pending branch with 403', function (): void {
    Sanctum::actingAs(gatedBranch(BranchStatusEnum::Pending), ['*'], 'branch_api');

    $this->getJson('/api/v1/branch/dashboard')->assertForbidden();
});

it('lets an enabled branch through the gate', function (): void {
    Sanctum::actingAs(gatedBranch(BranchStatusEnum::Enabled), ['*'], 'branch_api');

    $this->getJson('/api/v1/branch/dashboard')->assertOk();
    $this->getJson('/api/v1/branch/settings')->assertOk();
});

it('still lets a deactivated branch log out', function (): void {
    $branch = gatedBranch(BranchStatusEnum::Disabled);
    $token = $branch->createToken('branch-app')->plainTextToken;

    $this->withToken($token)->postJson('/api/v1/branch/logout')->assertOk();
    expect($branch->tokens()->count())->toBe(0);
});

it('revokes access mid-session when an enabled branch is deactivated', function (): void {
    $branch = gatedBranch(BranchStatusEnum::Enabled);
    $token = $branch->createToken('branch-app')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/branch/dashboard')->assertOk();

    $branch->update(['status' => BranchStatusEnum::Disabled]);
    app('auth')->forgetGuards();

    $this->withToken($token)->getJson('/api/v1/branch/dashboard')->assertForbidden();
});

it('blocks a managed barber while the managing branch is deactivated', function (): void {
    $branch = gatedBranch(BranchStatusEnum::Disabled);
    $barber = BarberModel::factory()->create([
        'status' => BarberStatusEnum::Enabled,
        'has_login' => true,
        'managed_by_branch_id' => $branch->getKey(),
    ]);
    Sanctum::actingAs($barber, ['*'], 'barber');

    $this->getJson('/api/v1/barber/settings')->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

    $branch->update(['status' => BranchStatusEnum::Enabled]);

    $this->getJson('/api/v1/barber/settings')->assertOk();
});

it('does not gate barbers that no branch manages', function (): void {
    gatedBranch(BranchStatusEnum::Disabled);
    $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled, 'has_login' => true]);
    Sanctum::actingAs($barber, ['*'], 'barber');

    $this->getJson('/api/v1/barber/settings')->assertOk();
});
