<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Preference\Models\PreferenceModel;

function createBrandService(BrandModel $brand, CurrencyModel $currency, int $priceAmountMinor = 10000): OfferedServiceModel
{
    return OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'serviceable_id' => $brand->id,
        'currency_code' => $currency->code,
        'price_amount_minor' => $priceAmountMinor,
        'catalog_item_id' => null,
        'is_active' => true,
    ]);
}

function clientBearerToken(ClientModel $client): string
{
    return $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;
}

it('populates display_price for a client whose display currency differs from the base currency', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $eur = CurrencyModel::factory()->create(['code' => 'EUR']);
    ExchangeRateModel::factory()->create(['from_currency_code' => $usd->code, 'to_currency_code' => $eur->code, 'rate_ratio' => 0.9]);

    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);

    $client = ClientModel::factory()->create();
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'client',
        'preferenceable_id' => $client->id,
        'display_currency_code' => $eur->code,
    ]);

    $services = $this->withToken(clientBearerToken($client))
        ->getJson("/api/v1/explore/branches/{$branch->id}")
        ->assertOk()
        ->json('data.services');

    $payload = collect($services)->firstWhere('id', $service->id);

    expect($payload['display_price'])->toEqual(['amount_minor' => 9000, 'currency_code' => 'EUR'])
        ->and($payload['conversion_unavailable'])->toBeFalse()
        ->and($payload['price_amount_minor'])->toBe(10000);
});

it('falls back to the base price with conversion_unavailable when no rate exists', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $eur = CurrencyModel::factory()->create(['code' => 'EUR']);

    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);

    $client = ClientModel::factory()->create();
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'client',
        'preferenceable_id' => $client->id,
        'display_currency_code' => $eur->code,
    ]);

    $payload = collect(
        $this->withToken(clientBearerToken($client))
            ->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->json('data.services')
    )->firstWhere('id', $service->id);

    expect($payload['conversion_unavailable'])->toBeTrue()
        ->and($payload['display_price'])->toBeNull()
        ->and($payload['price_amount_minor'])->toBe(10000);
});

it('reports dual_price_display true when the owning brand enables dual display', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $eur = CurrencyModel::factory()->create(['code' => 'EUR']);
    ExchangeRateModel::factory()->create(['from_currency_code' => $usd->code, 'to_currency_code' => $eur->code, 'rate_ratio' => 0.9]);

    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'brand',
        'preferenceable_id' => $brand->id,
        'allows_dual_price_display' => true,
    ]);

    $client = ClientModel::factory()->create();
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'client',
        'preferenceable_id' => $client->id,
        'display_currency_code' => $eur->code,
    ]);

    $payload = collect(
        $this->withToken(clientBearerToken($client))
            ->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->json('data.services')
    )->firstWhere('id', $service->id);

    expect($payload['allows_dual_price_display'])->toBeTrue()
        ->and($payload['price_amount_minor'])->toBe(10000)
        ->and($payload['display_price'])->toEqual(['amount_minor' => 9000, 'currency_code' => 'EUR']);
});

it('reports dual_price_display false (converted only) by default', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $eur = CurrencyModel::factory()->create(['code' => 'EUR']);
    ExchangeRateModel::factory()->create(['from_currency_code' => $usd->code, 'to_currency_code' => $eur->code, 'rate_ratio' => 0.9]);

    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);

    $client = ClientModel::factory()->create();
    PreferenceModel::factory()->create([
        'preferenceable_type' => 'client',
        'preferenceable_id' => $client->id,
        'display_currency_code' => $eur->code,
    ]);

    $payload = collect(
        $this->withToken(clientBearerToken($client))
            ->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->json('data.services')
    )->firstWhere('id', $service->id);

    expect($payload['allows_dual_price_display'])->toBeFalse();
});

it('converts for a guest using the X-Display-Currency header', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $eur = CurrencyModel::factory()->create(['code' => 'EUR']);
    ExchangeRateModel::factory()->create(['from_currency_code' => $usd->code, 'to_currency_code' => $eur->code, 'rate_ratio' => 0.9]);

    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);

    $payload = collect(
        $this->withHeader('X-Display-Currency', 'eur')
            ->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->json('data.services')
    )->firstWhere('id', $service->id);

    expect($payload['display_price'])->toEqual(['amount_minor' => 9000, 'currency_code' => 'EUR']);
});

it('omits display_price fields for a guest with no display currency', function () {
    $usd = CurrencyModel::factory()->create(['code' => 'USD']);
    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $service = createBrandService($brand, $usd, 10000);

    $payload = collect(
        $this->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->json('data.services')
    )->firstWhere('id', $service->id);

    expect($payload)->not->toHaveKey('display_price')
        ->and($payload)->not->toHaveKey('conversion_unavailable')
        ->and($payload['price_amount_minor'])->toBe(10000);
});
