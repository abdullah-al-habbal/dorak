<?php

declare(strict_types=1);

use Modules\Barber\Database\Seeders\BarberSeeder;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Database\Seeders\BranchSeeder;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Database\Seeders\BrandSeeder;
use Modules\Brand\Models\BrandModel;
use Modules\Explore\Constants\PublicProfileConstants;

it('seeds branches, brands and stylists with a valid public slug and en/ar tags', function (): void {
    $this->seed([BarberSeeder::class, BranchSeeder::class, BrandSeeder::class]);
    $pattern = '/^'.PublicProfileConstants::EXPLORE_PROFILE_SLUG_PATTERN.'$/';

    foreach ([BranchModel::query()->get(), BrandModel::query()->get(), BarberModel::query()->get()] as $rows) {
        expect($rows)->not->toBeEmpty();
        $rows->each(fn ($row) => expect((string) $row->getAttribute('slug'))->toMatch($pattern));
        expect($rows->pluck('slug')->unique())->toHaveCount($rows->count());
    }

    BranchModel::query()->get()->each(function (BranchModel $branch): void {
        expect($branch->tagTranslations())->not->toBeEmpty();
        foreach ($branch->tagTranslations() as $tag) {
            expect($tag['en'])->not->toBe('')->and($tag['ar'])->not->toBe('');
        }
    });
});

it('gives two factory branches with the same English name distinct slugs', function (): void {
    $names = ['en' => 'Same Name', 'ar' => 'نفس الاسم'];
    $first = BranchModel::factory()->create(['name' => $names]);
    $second = BranchModel::factory()->create(['name' => $names]);

    expect($first->slug)->toBe('same-name')->and($second->slug)->toBe('same-name-2');
});
