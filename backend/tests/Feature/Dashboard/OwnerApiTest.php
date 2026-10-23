<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Modules\Ban\Models\BanModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

/** @return array{owner: ClientModel, brand: BrandModel, branches: list<BranchModel>, otherBranch: BranchModel} */
function ownerWithBrand(): array
{
    $owner = ClientModel::factory()->create(['email' => 'owner@example.test', 'password' => Hash::make('owner-password')]);
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatures::MULTI_BRANCH => true]);
    $branches = BranchModel::factory()->count(2)->create(['brand_id' => $brand->id]);
    $otherBranch = BranchModel::factory()->create();

    return ['owner' => $owner, 'brand' => $brand, 'branches' => $branches->all(), 'otherBranch' => $otherBranch];
}

/** @return array<string, mixed> */
function ownerClaimPayload(string $claim): array
{
    $payload = json_decode((string) base64_decode(strtr(explode('.', $claim)[1], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);

    return is_array($payload) ? $payload : [];
}

function ownerBranchPayload(string $brandId, string $email): array
{
    return [
        'brand_id' => $brandId,
        'name' => ['en' => 'Downtown', 'ar' => 'وسط البلد'],
        'email' => $email,
        'password' => 'branch-password-123',
    ];
}

describe('owner dashboard login', function (): void {
    it('issues an owner session carrying the owned brand ids', function (): void {
        ['owner' => $owner, 'brand' => $brand] = ownerWithBrand();
        $secondBrand = BrandModel::factory()->create(['owner_id' => $owner->id]);

        $response = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'owner',
            'email' => 'owner@example.test',
            'password' => 'owner-password',
        ])->assertOk();

        $claim = ownerClaimPayload((string) $response->json('data.claim'));
        expect($claim)->toMatchArray([
            'actor_type' => 'owner',
            'role' => 'brand_owner',
            'sub' => $owner->id,
        ])->and($claim['brand_ids'])->toEqualCanonicalizing([$brand->id, $secondBrand->id]);
        expect($response->json('data.refresh_token'))->toBeString();

        $this->withToken((string) $response->json('data.token'))
            ->withHeader('X-Dashboard-Session', (string) $response->json('data.claim'))
            ->getJson('/api/v1/dashboard/me')
            ->assertOk()
            ->assertJsonPath('data.actor_type', 'owner')
            ->assertJsonPath('data.role', 'brand_owner');
    });

    it('rejects a client who owns no brand, a wrong password, or an unverified owner', function (array $setup, string $password): void {
        $client = ClientModel::factory()->create(['email' => 'owner@example.test', 'password' => Hash::make('owner-password'), ...$setup['client']]);
        if ($setup['owns']) {
            BrandModel::factory()->create(['owner_id' => $client->id]);
        }

        $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'owner',
            'email' => 'owner@example.test',
            'password' => $password,
        ])->assertUnauthorized();

        expect($client->tokens()->count())->toBe(0);
    })->with([
        'no brand' => [['client' => [], 'owns' => false], 'owner-password'],
        'wrong password' => [['client' => [], 'owns' => true], 'wrong-password'],
        'unverified' => [['client' => ['email_verified_at' => null], 'owns' => true], 'owner-password'],
        'disabled' => [['client' => ['status' => ClientStatusEnum::Disabled], 'owns' => true], 'owner-password'],
    ]);

    it('rejects a banned owner with ACCOUNT_BANNED', function (): void {
        ['owner' => $owner] = ownerWithBrand();
        BanModel::factory()->create([
            'bannable_type' => $owner->getMorphClass(),
            'bannable_id' => $owner->id,
            'banned_from' => now()->subDay(),
            'banned_until' => null,
        ]);

        $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'owner',
            'email' => 'owner@example.test',
            'password' => 'owner-password',
        ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
    });

    it('refreshes an owner session and drops it once the brand is gone', function (): void {
        ['brand' => $brand] = ownerWithBrand();
        $login = $this->postJson('/api/v1/dashboard/login', [
            'actor_type' => 'owner',
            'email' => 'owner@example.test',
            'password' => 'owner-password',
        ])->assertOk();

        $refreshed = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $login->json('data.refresh_token')])
            ->assertOk();
        expect(ownerClaimPayload((string) $refreshed->json('data.claim'))['actor_type'])->toBe('owner');

        $brand->forceFill(['owner_id' => ClientModel::factory()->create()->id])->save();

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $refreshed->json('data.refresh_token')])
            ->assertUnauthorized();
    });

    it('does not let a mobile client token into the dashboard', function (): void {
        ['owner' => $owner] = ownerWithBrand();
        $mobileToken = $owner->createToken('client-app', $owner->accessTokenAbilities())->plainTextToken;

        $this->withToken($mobileToken)->getJson('/api/v1/dashboard/branches')->assertUnauthorized();
    });
});

describe('owner branch management', function (): void {
    it('lists only the branches of owned brands', function (): void {
        ['owner' => $owner, 'branches' => $branches] = ownerWithBrand();

        $ids = $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/branches')
            ->assertOk()
            ->json('data.*.id');

        expect($ids)->toEqualCanonicalizing(array_map(fn (BranchModel $branch) => $branch->id, $branches));
    });

    it('shows an owned branch and 404s another brand\'s branch', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($owner)->getJson("/api/v1/dashboard/branches/{$branches[0]->id}")->assertOk();
        $this->authenticateDashboardActor($owner)->getJson("/api/v1/dashboard/branches/{$other->id}")->assertNotFound();
    });

    it('creates a branch in an owned brand and is refused for another brand', function (): void {
        ['owner' => $owner, 'brand' => $brand, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($owner)
            ->postJson('/api/v1/dashboard/branches', ownerBranchPayload($brand->id, 'new-branch@example.test'))
            ->assertCreated();
        expect(BranchModel::query()->where('email', 'new-branch@example.test')->value('brand_id'))->toBe($brand->id);

        $this->authenticateDashboardActor($owner)
            ->postJson('/api/v1/dashboard/branches', ownerBranchPayload($other->brand_id, 'foreign@example.test'))
            ->assertForbidden();
        expect(BranchModel::query()->where('email', 'foreign@example.test')->exists())->toBeFalse();
    });

    it('updates an owned branch and is refused for another brand\'s branch', function (): void {
        ['owner' => $owner, 'brand' => $brand, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($owner)
            ->putJson("/api/v1/dashboard/branches/{$branches[0]->id}", ownerBranchPayload($brand->id, $branches[0]->email))
            ->assertOk();
        expect($branches[0]->fresh()->getTranslation('name', 'en'))->toBe('Downtown');

        $this->authenticateDashboardActor($owner)
            ->putJson("/api/v1/dashboard/branches/{$other->id}", ownerBranchPayload($other->brand_id, $other->email))
            ->assertForbidden();
    });

    it('cannot move an owned branch into a brand it does not own', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($owner)
            ->putJson("/api/v1/dashboard/branches/{$branches[0]->id}", ownerBranchPayload($other->brand_id, $branches[0]->email))
            ->assertForbidden();
    });

    it('deletes an owned branch but not another brand\'s', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($owner)->deleteJson("/api/v1/dashboard/branches/{$branches[1]->id}")->assertSuccessful();
        $this->authenticateDashboardActor($owner)->deleteJson("/api/v1/dashboard/branches/{$other->id}")->assertForbidden();
        expect(BranchModel::query()->whereKey($other->id)->exists())->toBeTrue();
    });
});

describe('owner bookings and operations', function (): void {
    it('reads bookings across every branch of the brand only', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();
        $first = BookingModel::factory()->create(['branch_id' => $branches[0]->id]);
        $second = BookingModel::factory()->create(['branch_id' => $branches[1]->id]);
        $foreign = BookingModel::factory()->create(['branch_id' => $other->id]);

        $ids = $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/bookings')
            ->assertOk()
            ->json('data.*.id');

        expect($ids)->toEqualCanonicalizing([$first->id, $second->id]);
        $this->authenticateDashboardActor($owner)->getJson("/api/v1/dashboard/bookings/{$foreign->id}")->assertNotFound();
    });

    it('keeps a branch manager limited to their own branch', function (): void {
        ['branches' => $branches] = ownerWithBrand();
        $own = BookingModel::factory()->create(['branch_id' => $branches[0]->id]);
        BookingModel::factory()->create(['branch_id' => $branches[1]->id]);

        $ids = $this->authenticateDashboardActor($branches[0])
            ->getJson('/api/v1/dashboard/bookings')
            ->assertOk()
            ->json('data.*.id');

        expect($ids)->toBe([$own->id]);
    });

    it('creates chairs in owned branches only', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();
        $payload = fn (string $branchId): array => [
            'branch_id' => $branchId,
            'label' => 'Chair 9',
            'floor_zone' => 'shared',
            'status' => 'available',
            'ui_metadata' => ['position_x' => 1, 'position_y' => 1, 'width' => 1, 'height' => 1],
        ];

        $this->authenticateDashboardActor($owner)->postJson('/api/v1/dashboard/chairs', $payload($branches[1]->id))->assertCreated();
        $this->authenticateDashboardActor($owner)->postJson('/api/v1/dashboard/chairs', $payload($other->id))->assertForbidden();
        expect(ChairModel::query()->where('branch_id', $other->id)->where('label', 'Chair 9')->exists())->toBeFalse();
    });

    it('sums the overview across the brand\'s branches', function (): void {
        ['owner' => $owner, 'branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();
        BookingModel::factory()->create(['branch_id' => $branches[0]->id]);
        BookingModel::factory()->create(['branch_id' => $branches[1]->id]);
        BookingModel::factory()->create(['branch_id' => $other->id]);

        $this->authenticateDashboardActor($owner)
            ->getJson('/api/v1/dashboard/overview')
            ->assertOk()
            ->assertJsonPath('data.bookings_count', 2)
            ->assertJsonPath('data.active_branches_count', 2);
    });
});

describe('branch manager brand scope', function (): void {
    it('cannot move its branch into another brand', function (): void {
        ['branches' => $branches, 'otherBranch' => $other] = ownerWithBrand();

        $this->authenticateDashboardActor($branches[0])
            ->putJson("/api/v1/dashboard/branches/{$branches[0]->id}", ownerBranchPayload($other->brand_id, $branches[0]->email))
            ->assertForbidden();
    });
});
