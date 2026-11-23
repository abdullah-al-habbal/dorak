<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

const CATALOG_TAGS_URL = '/api/v1/dashboard/admin/catalog-tags';

/** NS-21: the admin's catalog tags. Authorization of the routes is pinned by DashboardAdminRouteAuthorizationTest. */
describe('Admin catalog tags', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('creates a tag with a slug generated from the English name and active by default', function (): void {
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Eco Friendly', 'ar' => 'صديق للبيئة'], 'group_name' => ['en' => 'Values', 'ar' => 'القيم']])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'eco-friendly')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.group_name', 'Values')
            ->assertJsonPath('data.group_name_translations.ar', 'القيم');

        expect(ServiceCatalogItemTagModel::query()->where('slug', 'eco-friendly')->exists())->toBeTrue();
    });

    it('gives a second tag with the same name a distinct slug, also when the first was deleted', function (): void {
        $payload = ['name' => ['en' => 'Vegan', 'ar' => 'نباتي']];
        $first = $this->postJson(CATALOG_TAGS_URL, $payload)->assertCreated()->json('data');
        $this->deleteJson(CATALOG_TAGS_URL.'/'.$first['id'])->assertOk();

        $second = $this->postJson(CATALOG_TAGS_URL, $payload)->assertCreated()->json('data');

        expect($first['slug'])->toBe('vegan')
            ->and($second['slug'])->not->toBe('vegan')
            ->and($second['slug'])->toStartWith('vegan-');
    });

    it('resolves the group in the request language and keeps both languages for the form', function (): void {
        $tag = ServiceCatalogItemTagModel::factory()->create(['group_name' => ['en' => 'Hair type', 'ar' => 'نوع الشعر']]);

        $this->withHeaders(['Accept-Language' => 'ar'])->getJson(CATALOG_TAGS_URL)
            ->assertOk()
            ->assertJsonPath('data.0.group_name', 'نوع الشعر')
            ->assertJsonPath('data.0.group_name_translations.en', 'Hair type')
            ->assertJsonPath('data.0.group_name_translations.ar', 'نوع الشعر');

        $this->withHeaders(['Accept-Language' => 'en'])->getJson(CATALOG_TAGS_URL)
            ->assertJsonPath('data.0.group_name', 'Hair type');

        expect($tag->fresh()->getTranslations('group_name'))->toEqualCanonicalizing(['en' => 'Hair type', 'ar' => 'نوع الشعر']);
    });

    it('answers null for a tag without a group', function (): void {
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Plain', 'ar' => 'عادي'], 'group_name' => null])
            ->assertCreated()
            ->assertJsonPath('data.group_name', null)
            ->assertJsonPath('data.group_name_translations', null);
    });

    it('rejects a group that is not filled in both languages or is plain text', function (array $group, string $field): void {
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Eco', 'ar' => 'بيئة'], 'group_name' => $group])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field]);

        expect(ServiceCatalogItemTagModel::query()->count())->toBe(0);
    })->with([
        'only English' => [['en' => 'Values'], 'group_name.ar'],
        'only Arabic' => [['ar' => 'القيم'], 'group_name.en'],
        'too long' => [['en' => str_repeat('a', 200), 'ar' => 'القيم'], 'group_name.en'],
    ]);

    it('rejects a group sent as plain text', function (): void {
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Eco', 'ar' => 'بيئة'], 'group_name' => 'Values'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['group_name']);
    });

    it('lists the tags', function (): void {
        ServiceCatalogItemTagModel::factory()->count(2)->create();

        $this->getJson(CATALOG_TAGS_URL)->assertOk()->assertJsonCount(2, 'data');
    });

    it('updates the names and the flag and never the slug', function (): void {
        $tag = ServiceCatalogItemTagModel::factory()->create(['slug' => 'fixed-slug']);

        $this->putJson(CATALOG_TAGS_URL."/{$tag->id}", ['name' => ['en' => 'Renamed', 'ar' => 'مُعاد'], 'is_active' => false, 'slug' => 'hijacked'])
            ->assertOk()
            ->assertJsonPath('data.slug', 'fixed-slug')
            ->assertJsonPath('data.name.en', 'Renamed')
            ->assertJsonPath('data.is_active', false);

        $fresh = $tag->fresh();
        expect($fresh->slug)->toBe('fixed-slug')->and($fresh->is_active)->toBeFalse();
    });

    it('rejects a missing or over-long name and an unknown locale without creating or changing anything', function (): void {
        $tag = ServiceCatalogItemTagModel::factory()->create();
        $before = $tag->getTranslations('name');
        $count = ServiceCatalogItemTagModel::query()->count();

        $this->postJson(CATALOG_TAGS_URL, [])->assertUnprocessable()->assertJsonValidationErrors(['name']);
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Only English']])->assertUnprocessable()->assertJsonValidationErrors(['name.ar']);
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'a', 'ar' => 'b', 'fr' => 'c']])->assertUnprocessable();
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => str_repeat('a', 300), 'ar' => 'b']])->assertUnprocessable()->assertJsonValidationErrors(['name.en']);
        $this->putJson(CATALOG_TAGS_URL."/{$tag->id}", ['name' => ['en' => 'a']])->assertUnprocessable()->assertJsonValidationErrors(['name.ar']);
        $this->putJson(CATALOG_TAGS_URL."/{$tag->id}", ['name' => ['en' => 'a', 'ar' => 'b'], 'is_active' => 'maybe'])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);

        expect(ServiceCatalogItemTagModel::query()->count())->toBe($count)
            ->and($tag->fresh()->getTranslations('name'))->toEqual($before);
    });

    it('soft-deletes a tag, keeps its row, and the items that carried it stop listing it', function (): void {
        $tag = ServiceCatalogItemTagModel::factory()->create();
        $item = ServiceCatalogItemModel::factory()->create();
        $item->tags()->attach($tag->id);

        $this->deleteJson(CATALOG_TAGS_URL."/{$tag->id}")->assertOk();

        expect(ServiceCatalogItemTagModel::query()->find($tag->id))->toBeNull()
            ->and(ServiceCatalogItemTagModel::withTrashed()->find($tag->id))->not->toBeNull()
            ->and($item->fresh()->tags()->count())->toBe(0);
        $this->getJson(CATALOG_TAGS_URL)->assertOk()->assertJsonMissing(['id' => $tag->id]);
    });
});
