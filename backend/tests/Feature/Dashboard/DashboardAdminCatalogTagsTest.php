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
        $this->postJson(CATALOG_TAGS_URL, ['name' => ['en' => 'Eco Friendly', 'ar' => 'صديق للبيئة'], 'group_name' => 'Values'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'eco-friendly')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.group_name', 'Values');

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
