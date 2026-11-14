<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;
use Modules\Language\Models\LanguageModel;

const REFERENCE_BASE = '/api/v1/dashboard/admin';

function currencyPayload(array $extra = []): array
{
    return array_merge(['code' => 'QQQ', 'name' => ['en' => 'Quartz', 'ar' => 'كوارتز'], 'symbol' => 'Q'], $extra);
}

/** NS-19: currencies and exchange rates; the guards the back-office matrix does not pin. */
describe('Admin currencies (NS-19)', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('lists every currency by code, including retired ones', function (): void {
        CurrencyModel::factory()->create(['code' => 'ZZB', 'is_active' => false]);
        CurrencyModel::factory()->create(['code' => 'ZZA', 'is_active' => true]);

        $codes = collect($this->getJson(REFERENCE_BASE.'/currencies')->assertOk()->json('data'))->pluck('code')->all();

        expect($codes)->toContain('ZZA', 'ZZB')
            ->and(array_search('ZZA', $codes, true))->toBeLessThan(array_search('ZZB', $codes, true));
    });

    it('creates an active non-default currency', function (): void {
        $this->postJson(REFERENCE_BASE.'/currencies', currencyPayload(['is_default' => true, 'is_active' => false]))
            ->assertCreated()
            ->assertJsonPath('data.code', 'QQQ')
            ->assertJsonPath('data.is_default', false)
            ->assertJsonPath('data.is_active', true);

        expect(CurrencyModel::query()->where('code', 'QQQ')->sole()->symbol)->toBe('Q');
    });

    it('validates a new currency', function (array $payload, string $field): void {
        CurrencyModel::factory()->create(['code' => 'DUP']);

        $this->postJson(REFERENCE_BASE.'/currencies', array_merge(currencyPayload(), $payload))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);
    })->with([
        'duplicate code' => [['code' => 'DUP'], 'code'],
        'lower-case code' => [['code' => 'abc'], 'code'],
        'short code' => [['code' => 'AB'], 'code'],
        'missing Arabic name' => [['name' => ['en' => 'Only']], 'name.ar'],
        'long symbol' => [['symbol' => str_repeat('x', 11)], 'symbol'],
        'missing symbol' => [['symbol' => ''], 'symbol'],
    ]);

    it('edits the names and symbol but never the code or the flags', function (): void {
        $currency = CurrencyModel::factory()->create(['code' => 'EDT', 'is_default' => false, 'is_active' => true]);

        $this->putJson(REFERENCE_BASE."/currencies/{$currency->id}", currencyPayload(['code' => 'XXX', 'is_default' => true, 'is_active' => false, 'symbol' => 'E']))
            ->assertOk()
            ->assertJsonPath('data.symbol', 'E');

        expect($currency->fresh())
            ->code->toBe('EDT')
            ->is_default->toBeFalse()
            ->is_active->toBeTrue();
    });

    it('retires and restores a non-default currency', function (): void {
        $currency = CurrencyModel::factory()->create(['is_default' => false, 'is_active' => true]);

        $this->patchJson(REFERENCE_BASE."/currencies/{$currency->id}/active", ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->patchJson(REFERENCE_BASE."/currencies/{$currency->id}/active", ['is_active' => true])->assertOk()->assertJsonPath('data.is_active', true);
    });
});

describe('Admin exchange rates (NS-19)', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->from = CurrencyModel::factory()->create(['is_active' => true]);
        $this->to = CurrencyModel::factory()->create(['is_active' => true]);
        $this->rate = fn (array $extra = []): array => array_merge([
            'from_currency_code' => $this->from->code,
            'to_currency_code' => $this->to->code,
            'rate_ratio' => '12.5',
        ], $extra);
    });

    it('adds a rate that takes effect now unless a date is given', function (): void {
        $this->postJson(REFERENCE_BASE.'/exchange-rates', ($this->rate)())
            ->assertCreated()
            ->assertJsonPath('data.from_currency_code', $this->from->code);

        $this->postJson(REFERENCE_BASE.'/exchange-rates', ($this->rate)(['rate_ratio' => '13', 'effective_at' => '2026-01-01']))->assertCreated();

        expect(ExchangeRateModel::query()->count())->toBe(2)
            ->and(ExchangeRateModel::query()->where('effective_at', '<', '2026-06-01')->count())->toBe(1);
    });

    it('rejects an inactive or unknown currency, the same pair, and an out-of-range rate', function (array $override, string $field): void {
        $inactive = CurrencyModel::factory()->create(['is_active' => false]);

        $payload = ($this->rate)(array_map(
            fn (mixed $value): mixed => match ($value) {
                '@inactive' => $inactive->code,
                '@same' => $this->from->code,
                default => $value,
            },
            $override,
        ));

        $this->postJson(REFERENCE_BASE.'/exchange-rates', $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(ExchangeRateModel::query()->count())->toBe(0);
    })->with([
        'inactive source' => [['from_currency_code' => '@inactive'], 'from_currency_code'],
        'inactive target' => [['to_currency_code' => '@inactive'], 'to_currency_code'],
        'unknown target' => [['to_currency_code' => 'NOP'], 'to_currency_code'],
        'same pair' => [['to_currency_code' => '@same'], 'to_currency_code'],
        'zero rate' => [['rate_ratio' => '0'], 'rate_ratio'],
        'too small' => [['rate_ratio' => '0.0000001'], 'rate_ratio'],
        'too large' => [['rate_ratio' => '100000000000000'], 'rate_ratio'],
        'not a number' => [['rate_ratio' => 'abc'], 'rate_ratio'],
        'bad date' => [['effective_at' => 'someday'], 'effective_at'],
    ]);

    it('removes only the chosen rate', function (): void {
        $keep = ExchangeRateModel::factory()->create();
        $drop = ExchangeRateModel::factory()->create();

        $this->deleteJson(REFERENCE_BASE."/exchange-rates/{$drop->id}")->assertOk();

        expect(ExchangeRateModel::query()->pluck('id')->all())->toBe([$keep->id]);
    });
});

describe('Admin languages (NS-20)', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('lists the default language first with its direction and flags', function (): void {
        LanguageModel::factory()->create(['code' => 'aa', 'is_default' => false]);
        $default = LanguageModel::factory()->create(['code' => 'zz', 'is_default' => true]);

        $this->getJson(REFERENCE_BASE.'/languages')
            ->assertOk()
            ->assertJsonPath('data.0.id', $default->id)
            ->assertJsonStructure(['data' => [['id', 'code', 'name', 'text_direction', 'is_default', 'is_active']]]);
    });

    it('refuses to switch the default language off', function (): void {
        $default = LanguageModel::factory()->create(['is_default' => true, 'is_active' => true]);

        $this->patchJson(REFERENCE_BASE."/languages/{$default->id}/active", ['is_active' => false])->assertStatus(409);

        expect($default->fresh()->is_active)->toBeTrue();
    });

    it('validates the active flag', function (): void {
        $language = LanguageModel::factory()->create(['is_default' => false]);

        $this->patchJson(REFERENCE_BASE."/languages/{$language->id}/active", [])->assertUnprocessable();
        $this->patchJson(REFERENCE_BASE."/languages/{$language->id}/active", ['is_active' => 'maybe'])->assertUnprocessable();
    });
});
