<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\OfferedService\Models\OfferedServiceModel;

const OWNER_MOBILE = '/api/v1/owner';

/** @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel, token: string} */
function mobileOwner(BrandStatusEnum $status = BrandStatusEnum::Active): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $status]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => true]);
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => $branch, 'token' => $owner->createToken('business-app', $owner->accessTokenAbilities())->plainTextToken];
}

describe('GET /owner/me', function (): void {
    it('reports the owner brands with their approval state', function (): void {
        ['token' => $token, 'brand' => $brand, 'owner' => $owner] = mobileOwner(BrandStatusEnum::Pending);
        BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => BrandStatusEnum::Active]);

        $response = $this->withToken($token)->getJson(OWNER_MOBILE.'/me')->assertOk()->assertJsonPath('data.is_owner', true);

        $states = collect($response->json('data.brands'))->pluck('status', 'id');
        expect($response->json('data.client_id'))->toBe((string) $owner->id);
        expect($states[$brand->id])->toBe('pending')->and($states)->toHaveCount(2)->and($response->json('data.branch_count'))->toBe(1);
    });

    it('answers is_owner false for an active client with no brand, so the app can offer web registration', function (): void {
        $client = ClientModel::factory()->create();
        $token = $client->createToken('app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)->getJson(OWNER_MOBILE.'/me')->assertOk()->assertJsonPath('data.is_owner', false)->assertJsonPath('data.brands', []);
    });

    it('is 401 without a token and for a barber token', function (): void {
        $this->getJson(OWNER_MOBILE.'/me')->assertUnauthorized();
        $barberToken = BarberModel::factory()->create()->createToken('barber-app', [TokenAbility::BarberApp->value])->plainTextToken;
        $this->withToken($barberToken)->getJson(OWNER_MOBILE.'/me')->assertUnauthorized();
    });
});

describe('owner/* access control', function (): void {
    it('is 401 without a token', function (string $path): void {
        $this->getJson(OWNER_MOBILE.$path)->assertUnauthorized();
    })->with(['/brands', '/branches', '/services', '/stylists', '/subscription', '/payouts', '/earnings']);

    it('is 403 for a client that owns no brand', function (string $path): void {
        $client = ClientModel::factory()->create();
        $token = $client->createToken('app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)->getJson(OWNER_MOBILE.$path)->assertForbidden();
    })->with(['/brands', '/branches', '/services', '/stylists', '/subscription', '/payouts']);

    it('is 401 for branch and barber tokens', function (): void {
        $branchToken = BranchModel::factory()->create()->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;
        $barberToken = BarberModel::factory()->create()->createToken('barber-app', [TokenAbility::BarberApp->value])->plainTextToken;

        $this->withToken($branchToken)->getJson(OWNER_MOBILE.'/branches')->assertUnauthorized();
        $this->withToken($barberToken)->getJson(OWNER_MOBILE.'/branches')->assertUnauthorized();
    });

    it('refuses an owner dashboard token (the dashboard ability is not a mobile ability)', function (): void {
        ['owner' => $owner] = mobileOwner();
        $token = $owner->createToken('dashboard', [TokenAbility::Dashboard->value])->plainTextToken;

        $this->withToken($token)->getJson(OWNER_MOBILE.'/branches')->assertForbidden()->assertJsonPath('code', 'TOKEN_ABILITY_MISSING');
    });

    it('keeps a mobile owner token out of the dashboard API', function (): void {
        ['token' => $token] = mobileOwner();

        $this->withToken($token)->getJson('/api/v1/dashboard/branches')->assertForbidden()->assertJsonPath('code', 'TOKEN_ABILITY_MISSING');
        $this->withToken($token)->getJson('/api/v1/dashboard/brands')->assertForbidden()->assertJsonPath('code', 'TOKEN_ABILITY_MISSING');
    });
});

describe('owner/* data and tenant scope', function (): void {
    it('lists and shows only the owner brands and branches', function (): void {
        ['token' => $token, 'brand' => $brand, 'branch' => $branch] = mobileOwner();
        $foreign = BranchModel::factory()->create();
        BrandModel::factory()->create();

        expect(collect($this->withToken($token)->getJson(OWNER_MOBILE.'/brands')->assertOk()->json('data'))->pluck('id')->all())->toBe([$brand->id])
            ->and(collect($this->withToken($token)->getJson(OWNER_MOBILE.'/branches')->assertOk()->json('data'))->pluck('id')->all())->toBe([$branch->id]);
        $this->withToken($token)->getJson(OWNER_MOBILE."/branches/{$branch->id}")->assertOk();
        $this->withToken($token)->getJson(OWNER_MOBILE."/branches/{$foreign->id}")->assertNotFound();
        $this->withToken($token)->getJson(OWNER_MOBILE."/brands/{$foreign->brand_id}")->assertNotFound();
    });

    it('cannot update or switch a branch of another brand', function (): void {
        ['token' => $token] = mobileOwner();
        $foreign = BranchModel::factory()->create();

        $this->withToken($token)->putJson(OWNER_MOBILE."/branches/{$foreign->id}", ['brand_id' => $foreign->brand_id, 'email' => $foreign->email, 'name' => ['en' => 'Hacked', 'ar' => 'x']])->assertForbidden();
        $this->withToken($token)->patchJson(OWNER_MOBILE."/branches/{$foreign->id}/switch-off")->assertNotFound();
        expect($foreign->fresh()->getTranslation('name', 'en'))->not->toBe('Hacked');
    });

    it('validates a new branch and creates one inside the owner brand', function (): void {
        ['token' => $token, 'brand' => $brand] = mobileOwner();

        $this->withToken($token)->postJson(OWNER_MOBILE.'/branches', [])->assertUnprocessable();
        $this->withToken($token)->postJson(OWNER_MOBILE.'/branches', ['brand_id' => $brand->id, 'name' => ['en' => 'Downtown', 'ar' => 'وسط'], 'email' => 'dt@example.test', 'password' => 'branch-password-123'])->assertCreated();
        expect(BranchModel::query()->where('brand_id', $brand->id)->count())->toBe(2);
    });

    it('cannot create a branch in another brand', function (): void {
        ['token' => $token] = mobileOwner();
        $foreignBrand = BrandModel::factory()->create();

        $this->withToken($token)->postJson(OWNER_MOBILE.'/branches', ['brand_id' => $foreignBrand->id, 'name' => ['en' => 'X', 'ar' => 'س'], 'email' => 'x@example.test', 'password' => 'branch-password-123'])->assertStatus(403);
        expect(BranchModel::query()->where('brand_id', $foreignBrand->id)->count())->toBe(0);
    });

    it('reads subscription, payouts and earnings', function (string $path): void {
        ['token' => $token] = mobileOwner();

        $this->withToken($token)->getJson(OWNER_MOBILE.$path)->assertOk();
    })->with(['/subscription', '/payouts', '/earnings']);

    it('manages services of its own brand only', function (): void {
        ['token' => $token, 'brand' => $brand] = mobileOwner();
        $mine = OfferedServiceModel::factory()->create(['serviceable_id' => $brand->id]);
        $foreign = OfferedServiceModel::factory()->create();

        expect(collect($this->withToken($token)->getJson(OWNER_MOBILE.'/services')->assertOk()->json('data'))->pluck('id')->all())->toBe([$mine->id]);
        $this->withToken($token)->getJson(OWNER_MOBILE."/services/{$foreign->id}")->assertNotFound();
        $this->withToken($token)->deleteJson(OWNER_MOBILE."/services/{$foreign->id}")->assertNotFound();
        expect(OfferedServiceModel::query()->whereKey($foreign->id)->exists())->toBeTrue();
    });
});

describe('owner/* brand states (D11 and suspension)', function (): void {
    it('blocks a second branch for a pending brand, server-side', function (): void {
        ['token' => $token, 'brand' => $brand] = mobileOwner(BrandStatusEnum::Pending);

        $this->withToken($token)->postJson(OWNER_MOBILE.'/branches', ['brand_id' => $brand->id, 'name' => ['en' => 'B2', 'ar' => 'ب٢'], 'email' => 'b2@example.test', 'password' => 'a-branch-password-1'])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
    });

    it('lets a pending owner read and edit the brand profile', function (): void {
        ['token' => $token, 'brand' => $brand] = mobileOwner(BrandStatusEnum::Pending);

        $this->withToken($token)->getJson(OWNER_MOBILE."/brands/{$brand->id}")->assertOk()->assertJsonPath('data.status', 'pending');
        $this->withToken($token)->putJson(OWNER_MOBILE."/brands/{$brand->id}", ['name' => ['en' => 'Renamed', 'ar' => 'جديد'], 'base_currency_code' => $brand->base_currency_code])->assertOk();
    });

    it('makes a suspended brand read-only', function (): void {
        ['token' => $token, 'brand' => $brand, 'branch' => $branch] = mobileOwner(BrandStatusEnum::Suspended);

        $this->withToken($token)->getJson(OWNER_MOBILE.'/branches')->assertOk();
        $this->withToken($token)->postJson(OWNER_MOBILE.'/branches', ['brand_id' => $brand->id, 'name' => ['en' => 'B2', 'ar' => 'ب٢'], 'email' => 'b2@example.test', 'password' => 'a-branch-password-1'])->assertForbidden();
        $this->withToken($token)->putJson(OWNER_MOBILE."/branches/{$branch->id}", ['brand_id' => $brand->id, 'email' => $branch->email, 'name' => ['en' => 'Changed', 'ar' => 'غ']])->assertForbidden();
    });
});
