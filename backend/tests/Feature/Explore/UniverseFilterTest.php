<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\Universe;
use Modules\Core\Enums\VenueUniverse;
use Tests\Support\Constants\ExploreTestConstants;

function venue(string $universe): BranchModel
{
    return BranchModel::factory()->create(['latitude' => 33.5, 'longitude' => 36.3, 'universe' => $universe]);
}

function universeIds(string $query = ''): array
{
    return test()->getJson(ExploreTestConstants::EXPLORE_TEST_UNIVERSE_URL.$query)->assertOk()->json('data.*.id');
}

it('lists a unisex branch in both the men and women universes', function (): void {
    $unisex = venue('unisex');
    $men = venue('men');
    $women = venue('women');

    expect(universeIds('&universe=men'))->toEqualCanonicalizing([$unisex->id, $men->id])
        ->and(universeIds('&universe=women'))->toEqualCanonicalizing([$unisex->id, $women->id]);
});

it('keeps a men branch out of the women universe', function (): void {
    $men = venue('men');

    expect(universeIds('&universe=women'))->not->toContain($men->id);
});

it('browses every universe for a guest who omits it', function (): void {
    $men = venue('men');
    $women = venue('women');

    expect(universeIds())->toEqualCanonicalizing([$men->id, $women->id]);
});

it('defaults to the signed-in client preferred universe', function (): void {
    $men = venue('men');
    $women = venue('women');
    $unisex = venue('unisex');
    $client = ClientModel::factory()->create(['preferred_universe' => Universe::Women]);
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $ids = $this->withToken($token)->getJson(ExploreTestConstants::EXPLORE_TEST_UNIVERSE_URL)->assertOk()->json('data.*.id');

    expect($ids)->toEqualCanonicalizing([$women->id, $unisex->id])->not->toContain($men->id);
});

it('lets an explicit universe override the client preference', function (): void {
    $men = venue('men');
    $client = ClientModel::factory()->create(['preferred_universe' => Universe::Women]);
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    expect($this->withToken($token)->getJson(ExploreTestConstants::EXPLORE_TEST_UNIVERSE_URL.'&universe=men')->json('data.*.id'))->toBe([$men->id]);
});

it('rejects an unknown universe value', function (string $path): void {
    $this->getJson($path.'?latitude=33.5&longitude=36.3&radius=1000&universe=kids')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['universe']);
})->with([
    'branches' => ['/api/v1/explore/branches'],
    'barbers' => ['/api/v1/explore/barbers'],
]);

it('filters barbers by the universe they serve', function (): void {
    $women = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3, 'universe' => VenueUniverse::Women]);
    $men = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3, 'universe' => VenueUniverse::Men]);
    $everyone = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3]);

    $ids = $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000&universe=women')
        ->assertOk()
        ->json('data.*.id');

    expect($ids)->toEqualCanonicalizing([$women->id, $everyone->id])->not->toContain($men->id)
        ->and($everyone->fresh()->universe)->toBe(VenueUniverse::Unisex);
});

it('gives a new branch its brand universe unless one is set', function (): void {
    $womenBrand = BrandModel::factory()->create(['universe' => VenueUniverse::Women]);

    $inherited = BranchModel::factory()->create(['brand_id' => $womenBrand->id]);
    $explicit = BranchModel::factory()->create(['brand_id' => $womenBrand->id, 'universe' => VenueUniverse::Unisex]);

    expect($inherited->fresh()->universe)->toBe(VenueUniverse::Women)
        ->and($explicit->fresh()->universe)->toBe(VenueUniverse::Unisex);
});

it('lets a barber set the universe they serve', function (): void {
    $barber = BarberModel::factory()->create(['has_login' => true]);

    $this->actingAs($barber, 'barber')
        ->patchJson('/api/v1/barber/profile', ['universe' => VenueUniverse::Women])
        ->assertOk();

    expect($barber->fresh()->universe)->toBe(VenueUniverse::Women);
});

it('exposes the universe on branch and barber payloads', function (): void {
    $branch = venue('unisex');

    $this->getJson("/api/v1/explore/branches/{$branch->id}")->assertOk()->assertJsonPath('data.universe', 'unisex');
});
