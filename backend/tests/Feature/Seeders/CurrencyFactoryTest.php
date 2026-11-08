<?php

declare(strict_types=1);

use Database\Seeders\DatabaseSeeder;
use Modules\Currency\Database\Seeders\CurrencySeeder;
use Modules\Currency\Models\CurrencyModel;

/** Every code Faker can produce, read by draining its unique generator, which is then reset. */
function allFakerCurrencyCodes(): array
{
    $codes = [];
    try {
        while (true) {
            $codes[] = fake()->unique()->currencyCode();
        }
    } catch (OverflowException) {
        fake()->unique(true);
    }

    return $codes;
}

describe('currency factory', function (): void {
    it('never reuses a code that is already stored', function (): void {
        $codes = allFakerCurrencyCodes();
        $free = array_pop($codes);
        foreach ($codes as $code) {
            CurrencyModel::factory()->create(['code' => $code]);
        }

        expect(CurrencyModel::factory()->create()->code)->toBe($free);
    });

    it('creates fresh currencies next to the seeded SYP and USD', function (): void {
        $this->seed(CurrencySeeder::class);

        $created = CurrencyModel::factory()->count(20)->create()->pluck('code');

        expect($created)->not->toContain('SYP')
            ->and($created)->not->toContain('USD')
            ->and($created->unique())->toHaveCount(20)
            ->and(CurrencyModel::query()->count())->toBe(22);
    });

    it('lets the full database seeder finish', function (): void {
        $this->seed(DatabaseSeeder::class);

        expect(CurrencyModel::query()->where('code', 'USD')->count())->toBe(1)
            ->and(CurrencyModel::query()->where('code', 'SYP')->count())->toBe(1);
    });
});
