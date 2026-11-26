<?php

declare(strict_types=1);

use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Testing\TestResponse;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandReviewService;
use Modules\Chair\Events\ChairStatusUpdated;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;

// The suite broadcasts through the null driver, which authorizes everything.
// Authorization tests need the signing driver with the real channel definitions.
beforeEach(function (): void {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);
    app(BroadcastManager::class)->purge('reverb');
    require base_path('modules/Core/Routes/channels.php');
});

/** @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel, stylist: BarberModel} */
function staffedBranch(BrandStatusEnum $brandStatus = BrandStatusEnum::Active, BranchStatusEnum $branchStatus = BranchStatusEnum::Enabled): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $brandStatus]);
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => $branchStatus]);
    $stylist = BarberModel::factory()->create();
    ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $stylist->id]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => $branch, 'stylist' => $stylist];
}

function channelAuth(object $test, AdminModel|BranchModel|BarberModel|ClientModel $account, string $channel): TestResponse
{
    $abilities = match (true) {
        $account instanceof BranchModel => TokenAbility::forBranchApp(),
        $account instanceof BarberModel => [TokenAbility::BarberApp->value],
        $account instanceof ClientModel => $account->accessTokenAbilities(),
        default => ['*'],
    };
    $token = $account->createToken('realtime', $abilities)->plainTextToken;
    app('auth')->forgetGuards();

    return $test->withToken($token)->postJson('/api/v1/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => $channel]);
}

dataset('non operational states', [
    'suspended brand' => [BrandStatusEnum::Suspended, BranchStatusEnum::Enabled],
    'pending brand' => [BrandStatusEnum::Pending, BranchStatusEnum::Enabled],
    'rejected brand' => [BrandStatusEnum::Rejected, BranchStatusEnum::Enabled],
    'disabled branch' => [BrandStatusEnum::Active, BranchStatusEnum::Disabled],
    'suspended branch' => [BrandStatusEnum::Active, BranchStatusEnum::Suspended],
    'pending branch' => [BrandStatusEnum::Active, BranchStatusEnum::Pending],
]);

it('authorizes an operational branch and its stylist on the channels they use', function (): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch();

    channelAuth($this, $branch, 'private-branch.'.$branch->id)->assertOk();
    channelAuth($this, $branch, 'private-barber.'.$stylist->id)->assertOk();
    channelAuth($this, $stylist, 'private-branch.'.$branch->id)->assertOk();
});

it('refuses a non operational branch its own channel and its stylists channels', function (BrandStatusEnum $brandStatus, BranchStatusEnum $branchStatus): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch($brandStatus, $branchStatus);

    channelAuth($this, $branch, 'private-branch.'.$branch->id)->assertForbidden();
    channelAuth($this, $branch, 'private-barber.'.$stylist->id)->assertForbidden();
})->with('non operational states');

it('refuses a stylist the channel of a non operational branch but keeps their own', function (BrandStatusEnum $brandStatus, BranchStatusEnum $branchStatus): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch($brandStatus, $branchStatus);

    channelAuth($this, $stylist, 'private-branch.'.$branch->id)->assertForbidden();
    channelAuth($this, $stylist, 'private-barber.'.$stylist->id)->assertOk();
})->with('non operational states');

it('keeps a platform admin on every branch and stylist channel', function (): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch(BrandStatusEnum::Suspended);
    $admin = AdminModel::factory()->create();

    channelAuth($this, $admin, 'private-branch.'.$branch->id)->assertOk();
    channelAuth($this, $admin, 'private-barber.'.$stylist->id)->assertOk();
});

it('keeps the owner on their client channel while the branch is refused, until reactivation', function (): void {
    ['owner' => $owner, 'brand' => $brand, 'branch' => $branch] = staffedBranch();
    $adminId = (string) AdminModel::factory()->create()->id;
    $reviews = app(BrandReviewService::class);

    $reviews->suspend((string) $brand->id, $adminId, 'Reason', false);
    channelAuth($this, $branch, 'private-branch.'.$branch->id)->assertForbidden();
    channelAuth($this, $owner, 'private-client.'.$owner->id)->assertOk();

    $reviews->reactivate((string) $brand->id, $adminId);
    channelAuth($this, $branch, 'private-branch.'.$branch->id)->assertOk();
});

it('still refuses an operational branch the channels of another branch', function (): void {
    ['branch' => $branch] = staffedBranch();
    ['branch' => $other, 'stylist' => $otherStylist] = staffedBranch();

    channelAuth($this, $branch, 'private-branch.'.$other->id)->assertForbidden();
    channelAuth($this, $branch, 'private-barber.'.$otherStylist->id)->assertForbidden();
});

it('broadcasts chair status on a private floor plan channel', function (): void {
    $channel = (new ChairStatusUpdated('chair-id', 'branch-id', 'available'))->broadcastOn();

    expect($channel)->toBeInstanceOf(PrivateChannel::class)
        ->and($channel->name)->toBe('private-floor-plan.branch-id');
});

it('authorizes an operational branch, its seated stylist and an admin on the floor plan channel', function (): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch();

    channelAuth($this, $branch, 'private-floor-plan.'.$branch->id)->assertOk();
    channelAuth($this, $stylist, 'private-floor-plan.'.$branch->id)->assertOk();
    channelAuth($this, AdminModel::factory()->create(), 'private-floor-plan.'.$branch->id)->assertOk();
});

it('refuses the floor plan channel of a non operational branch to the branch and its stylist', function (BrandStatusEnum $brandStatus, BranchStatusEnum $branchStatus): void {
    ['branch' => $branch, 'stylist' => $stylist] = staffedBranch($brandStatus, $branchStatus);

    channelAuth($this, $branch, 'private-floor-plan.'.$branch->id)->assertForbidden();
    channelAuth($this, $stylist, 'private-floor-plan.'.$branch->id)->assertForbidden();
})->with('non operational states');

it('refuses the floor plan channel to other branches, unseated stylists, clients and guests', function (): void {
    ['owner' => $owner, 'branch' => $branch] = staffedBranch();
    ['branch' => $other, 'stylist' => $otherStylist] = staffedBranch();
    $channel = 'private-floor-plan.'.$branch->id;

    channelAuth($this, $other, $channel)->assertForbidden();
    channelAuth($this, $otherStylist, $channel)->assertForbidden();
    channelAuth($this, $owner, $channel)->assertForbidden();

    app('auth')->forgetGuards();
    $this->flushHeaders()->postJson('/api/v1/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => $channel])->assertUnauthorized();
});
