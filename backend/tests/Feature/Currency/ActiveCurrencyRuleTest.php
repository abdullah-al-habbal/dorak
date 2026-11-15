<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Validator;
use Modules\Brand\Http\Requests\Client\UpdateBrandRequest;
use Modules\Brand\Support\BrandPayloadRules;
use Modules\Client\Models\ClientModel;
use Modules\Commission\Http\Requests\Admin\SaveCommissionRuleRequest;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Rules\ActiveCurrencyRule;
use Modules\Dashboard\Http\Requests\Business\ServiceRequest;
use Modules\OfferedService\Http\Requests\Barber\BarberServiceRequest;
use Modules\Preference\Http\Requests\Shared\UpdateSettingsRequest;
use Modules\Preference\Models\PreferenceModel;
use Modules\Subscription\Http\Requests\Admin\SavePlanRequest;

/** @return array<string, array{0: array<string, mixed>, 1: string}> */
function currencyRuleRequests(): array
{
    return [
        'mobile barber service' => [BarberServiceRequest::create('/', 'POST')->rules(), 'currency_code'],
        'dashboard service' => [ServiceRequest::create('/', 'POST')->rules(), 'currency_code'],
        'subscription plan' => [SavePlanRequest::create('/', 'POST')->rules(), 'currency_code'],
        'brand create payload' => [BrandPayloadRules::rules(), 'base_currency_code'],
        'brand update' => [UpdateBrandRequest::create('/', 'PATCH')->rules(), 'base_currency_code'],
        'commission rule' => [SaveCommissionRuleRequest::create('/', 'POST', ['type' => 'flat'])->rules(), 'currency_code'],
        'preference settings' => [UpdateSettingsRequest::create('/', 'PATCH')->rules(), 'display_currency_code'],
    ];
}

it('accepts an active currency and rejects a retired or unknown one', function (): void {
    $active = CurrencyModel::factory()->create(['is_active' => true]);
    $retired = CurrencyModel::factory()->create(['is_active' => false]);
    $rule = ['code' => [new ActiveCurrencyRule]];

    expect(Validator::make(['code' => $active->code], $rule)->passes())->toBeTrue()
        ->and(Validator::make(['code' => $retired->code], $rule)->passes())->toBeFalse()
        ->and(Validator::make(['code' => 'ZZZ'], $rule)->passes())->toBeFalse()
        ->and(Validator::make(['code' => ['USD']], $rule)->passes())->toBeFalse();
});

it('rejects a retired currency at every request that takes a currency code', function (string $label): void {
    [$rules, $field] = currencyRuleRequests()[$label];
    $active = CurrencyModel::factory()->create(['is_active' => true]);
    $retired = CurrencyModel::factory()->create(['is_active' => false]);

    $fieldRules = [$field => $rules[$field]];

    expect(Validator::make([$field => $active->code], $fieldRules)->passes())->toBeTrue($label.' accepts active')
        ->and(Validator::make([$field => $retired->code], $fieldRules)->passes())->toBeFalse($label.' rejects retired');
})->with(array_keys(currencyRuleRequests()));

it('rejects a retired display currency for a mobile client and keeps the stored preference readable', function (): void {
    $retired = CurrencyModel::factory()->create(['is_active' => true]);
    $client = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/client/settings', ['display_currency_code' => $retired->code])->assertOk();

    $retired->update(['is_active' => false]);

    $this->withToken($token)->getJson('/api/v1/client/settings')
        ->assertOk()
        ->assertJsonPath('data.display_currency_code', $retired->code);

    $other = CurrencyModel::factory()->create(['is_active' => false]);
    $this->withToken($token)->patchJson('/api/v1/client/settings', ['display_currency_code' => $other->code])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('display_currency_code');

    expect(PreferenceModel::query()->where('preferenceable_id', $client->id)->value('display_currency_code'))->toBe($retired->code);
});
