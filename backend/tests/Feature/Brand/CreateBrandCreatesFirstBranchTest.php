<?php

declare(strict_types=1);

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Hash;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Models\CurrencyModel;

beforeEach(function (): void {
    $this->owner = ClientModel::factory()->create();
    $this->currency = CurrencyModel::factory()->create();
    $this->actingAs($this->owner, 'client');
});

function brandPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'name' => ['en' => 'Royal Cuts', 'ar' => 'رويال كتس'],
        'base_currency_code' => test()->currency->code,
    ], $overrides);
}

it('creates exactly one first branch with the brand', function (): void {
    $response = $this->postJson('/api/v1/brands', brandPayload())->assertCreated();

    $brandId = $response->json('data.id');
    $branches = BranchModel::query()->where('brand_id', $brandId)->get();
    expect($branches)->toHaveCount(1)
        ->and($branches->first()->getTranslation('name', 'en'))->toBe('Royal Cuts')
        ->and($branches->first()->status)->toBe(BranchStatusEnum::Pending)
        ->and($branches->first()->email)->toEndWith('@branches.dorak.invalid')
        ->and($response->json('data.branches_count'))->toBe(1);
});

it('uses the first-branch details when given', function (): void {
    $this->postJson('/api/v1/brands', brandPayload(['first_branch' => [
        'name' => ['en' => 'Downtown', 'ar' => 'وسط البلد'],
        'latitude' => 33.5,
        'longitude' => 36.3,
        'email' => 'downtown@royal.test',
        'password' => 'branch-password-123',
    ]]))->assertCreated();

    $branch = BranchModel::query()->where('email', 'downtown@royal.test')->sole();
    expect($branch->getTranslation('name', 'en'))->toBe('Downtown')
        ->and((float) $branch->latitude)->toBe(33.5)
        ->and(Hash::check('branch-password-123', $branch->password))->toBeTrue();
});

it('rolls the brand back when the first branch cannot be created', function (): void {
    BranchModel::creating(fn () => throw new RuntimeException('branch insert failed'));

    $this->withoutExceptionHandling();
    expect(fn () => $this->postJson('/api/v1/brands', brandPayload()))->toThrow(RuntimeException::class);

    expect(BrandModel::query()->count())->toBe(0)
        ->and(BranchModel::query()->count())->toBe(0);
});

it('persists the universe and rejects invalid values', function (): void {
    $id = $this->postJson('/api/v1/brands', brandPayload(['universe' => VenueUniverse::Women]))->assertCreated()->json('data.id');

    expect(BrandModel::query()->findOrFail($id)->universe)->toBe(VenueUniverse::Women)
        ->and(BranchModel::query()->where('brand_id', $id)->sole()->universe)->toBe(VenueUniverse::Women);

    $this->postJson('/api/v1/brands', brandPayload(['universe' => 'kids']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['universe']);
});

it('defaults a brand without a universe to unisex', function (): void {
    $id = $this->postJson('/api/v1/brands', brandPayload())->assertCreated()->json('data.id');

    expect(BrandModel::query()->findOrFail($id)->universe)->toBe(VenueUniverse::Unisex);
});

it('gives same-named brands distinct slugs', function (): void {
    $first = $this->postJson('/api/v1/brands', brandPayload())->assertCreated()->json('data.slug');
    $second = $this->postJson('/api/v1/brands', brandPayload())->assertCreated()->json('data.slug');

    expect($first)->toBe('royal-cuts')->and($second)->toBe('royal-cuts-2');
});

it('enforces slug uniqueness in the database', function (): void {
    BrandModel::factory()->create(['slug' => 'taken']);

    expect(fn () => BrandModel::factory()->create(['slug' => 'taken']))->toThrow(QueryException::class);
});

it('lists brands with an integer branches_count', function (): void {
    $brand = BrandModel::factory()->create();
    BranchModel::factory()->count(2)->create(['brand_id' => $brand->id]);

    $item = collect($this->getJson('/api/v1/brands')->assertOk()->json('data'))->firstWhere('id', $brand->id);

    expect($item['branches_count'])->toBe(2);
});

it('validates first-branch credentials and coordinates as pairs', function (): void {
    $this->postJson('/api/v1/brands', brandPayload(['first_branch' => ['email' => 'x@royal.test', 'latitude' => 33.5]]))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['first_branch.password', 'first_branch.longitude']);
});
