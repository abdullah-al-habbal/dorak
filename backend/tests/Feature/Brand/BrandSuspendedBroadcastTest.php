<?php

declare(strict_types=1);

use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Events\BrandSuspendedEvent;
use Modules\Brand\Exceptions\BrandReviewException;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandReviewService;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Dashboard\Mail\OwnerBrandSuspended;

/** @return array{brand: BrandModel, owner: ClientModel, branch: BranchModel, adminId: string} */
function suspendableBrand(BrandStatusEnum $status = BrandStatusEnum::Active): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $status]);
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Enabled]);

    return ['brand' => $brand, 'owner' => $owner, 'branch' => $branch, 'adminId' => (string) AdminModel::factory()->create()->id];
}

/** @return list<string> */
function suspensionChannels(BrandSuspendedEvent $event): array
{
    return array_map(fn (PrivateChannel $channel): string => $channel->name, $event->broadcastOn());
}

beforeEach(function (): void {
    Mail::fake();
});

it('tells the owner and each enabled branch of the suspended brand, and nobody else', function (): void {
    Event::fake([BrandSuspendedEvent::class]);
    ['brand' => $brand, 'owner' => $owner, 'branch' => $branch, 'adminId' => $adminId] = suspendableBrand();
    $second = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Enabled]);
    BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Disabled]);
    suspendableBrand();

    app(BrandReviewService::class)->suspend((string) $brand->id, $adminId, 'Private reason', false);

    Event::assertDispatchedTimes(BrandSuspendedEvent::class, 1);
    Event::assertDispatched(BrandSuspendedEvent::class, function (BrandSuspendedEvent $event) use ($brand, $owner, $branch, $second): bool {
        expect(suspensionChannels($event))->toEqualCanonicalizing([
            'private-branch.'.$branch->id,
            'private-branch.'.$second->id,
            'private-client.'.$owner->id,
        ])
            ->and($event->broadcastAs())->toBe('brand.suspended')
            ->and($event->broadcastWith())->toBe(['brandId' => (string) $brand->id, 'status' => 'suspended']);

        return true;
    });
});

it('sends nothing when the brand cannot be suspended', function (): void {
    Event::fake([BrandSuspendedEvent::class]);
    ['brand' => $brand, 'adminId' => $adminId] = suspendableBrand(BrandStatusEnum::Pending);

    expect(fn () => app(BrandReviewService::class)->suspend((string) $brand->id, $adminId, 'Reason', false))
        ->toThrow(BrandReviewException::class);

    Event::assertNotDispatched(BrandSuspendedEvent::class);
});

it('still suspends and mails the owner when the broadcast fails', function (): void {
    Event::listen(BrandSuspendedEvent::class, fn () => throw new RuntimeException('broadcaster down'));
    ['brand' => $brand, 'adminId' => $adminId] = suspendableBrand();

    app(BrandReviewService::class)->suspend((string) $brand->id, $adminId, 'Reason', false);

    expect($brand->refresh()->status)->toBe(BrandStatusEnum::Suspended);
    Mail::assertQueued(OwnerBrandSuspended::class);
});

it('lets only the branch and the owner authorize the channels the event uses', function (): void {
    ['owner' => $owner, 'branch' => $branch] = suspendableBrand();
    ['owner' => $otherOwner, 'branch' => $otherBranch] = suspendableBrand();
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);
    app(BroadcastManager::class)->purge('reverb');
    require base_path('modules/Core/Routes/channels.php');
    $authorize = function (string $token, string $channel) {
        app('auth')->forgetGuards();

        return $this->withToken($token)->postJson('/api/v1/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => $channel]);
    };
    $ownerToken = $owner->createToken('business-app', $owner->accessTokenAbilities())->plainTextToken;
    $branchToken = $branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;

    $authorize($ownerToken, 'private-client.'.$owner->id)->assertOk();
    $authorize($ownerToken, 'private-client.'.$otherOwner->id)->assertForbidden();
    $authorize($branchToken, 'private-branch.'.$branch->id)->assertOk();
    $authorize($branchToken, 'private-branch.'.$otherBranch->id)->assertForbidden();
    $authorize($branchToken, 'private-client.'.$owner->id)->assertForbidden();
});

it('answers a signed-in branch with ACCOUNT_NOT_ACTIVE and the owner writes with brand_suspended', function (): void {
    ['brand' => $brand, 'owner' => $owner, 'branch' => $branch, 'adminId' => $adminId] = suspendableBrand();
    $branchToken = $branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;
    $ownerToken = $owner->createToken('business-app', $owner->accessTokenAbilities())->plainTextToken;
    $this->withToken($branchToken)->getJson('/api/v1/branch/profile')->assertOk();

    app(BrandReviewService::class)->suspend((string) $brand->id, $adminId, 'Reason', false);

    app('auth')->forgetGuards();
    $this->withToken($branchToken)->getJson('/api/v1/branch/profile')
        ->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
    app('auth')->forgetGuards();
    $this->withToken($ownerToken)->getJson('/api/v1/owner/brands')->assertOk();
    $this->withToken($ownerToken)->putJson('/api/v1/owner/brands/'.$brand->id, ['name' => ['en' => 'New', 'ar' => 'جديد']])
        ->assertForbidden()->assertJsonPath('code', 'brand_suspended');
});
