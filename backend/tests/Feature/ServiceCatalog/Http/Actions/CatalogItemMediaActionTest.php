<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\ServiceCatalog\Constants\ServiceCatalogMediaConstants;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

function catalogMediaUrl(ServiceCatalogItemModel $item, ?string $media = null): string
{
    return "/api/v1/dashboard/admin/catalog-items/{$item->id}/media".($media === null ? '' : "/{$media}");
}

/** FT-12: images attached to a catalog item by the platform admin. */
describe('Catalog item media (FT-12)', function (): void {
    beforeEach(function (): void {
        Storage::fake('public');
    });

    it('lets an admin attach images, last in order, and returns their public URL', function (): void {
        $item = ServiceCatalogItemModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $first = $this->post(catalogMediaUrl($item), ['file' => UploadedFile::fake()->image('a.png', 100, 100)], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.sort_order', 1);
        $second = $this->post(catalogMediaUrl($item), ['file' => UploadedFile::fake()->image('b.jpg', 100, 100)], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.sort_order', 2);

        $files = Storage::disk('public')->allFiles(ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_DIRECTORY);
        expect($files)->toHaveCount(2)
            ->and($first->json('data.image_url'))->toBe(Storage::disk('public')->url($first->json('data.image_path')))
            ->and($second->json('data.image_path'))->not->toContain('b.jpg');

        $this->getJson("/api/v1/dashboard/admin/catalog-items/{$item->id}")->assertOk()->assertJsonCount(2, 'data.media')->assertJsonPath('data.media.0.image_url', $first->json('data.image_url'));
    });

    it('refuses what is not a small raster image and stores nothing', function (UploadedFile $file): void {
        $item = ServiceCatalogItemModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->post(catalogMediaUrl($item), ['file' => $file], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        expect(Storage::disk('public')->allFiles())->toBe([])->and($item->media()->count())->toBe(0);
    })->with([
        'a script' => [fn () => UploadedFile::fake()->createWithContent('a.png', '<?php echo 1;')],
        'an svg' => [fn () => UploadedFile::fake()->createWithContent('a.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
        'too heavy' => [fn () => UploadedFile::fake()->image('a.png')->size(ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_KB + 1)],
        'too wide' => [fn () => UploadedFile::fake()->image('a.png', ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_SIDE + 1, 10)],
    ]);

    it('caps the number of images per item', function (): void {
        $item = ServiceCatalogItemModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        foreach (range(1, ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_PER_ITEM) as $_) {
            $item->media()->create(['media_type' => 'image', 'image_path' => 'catalog-media/x.png', 'sort_order' => 1]);
        }

        $this->post(catalogMediaUrl($item), ['file' => UploadedFile::fake()->image('a.png')], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        expect(Storage::disk('public')->allFiles())->toBe([]);
    });

    it('removes an image and its file, and never another item\'s image', function (): void {
        $item = ServiceCatalogItemModel::factory()->create();
        $other = ServiceCatalogItemModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $path = UploadedFile::fake()->image('a.png')->store(ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_DIRECTORY, 'public');
        $medium = $item->media()->create(['media_type' => 'image', 'image_path' => $path, 'sort_order' => 1]);

        $this->deleteJson(catalogMediaUrl($other, $medium->id))->assertNotFound();
        expect(Storage::disk('public')->exists($path))->toBeTrue();

        $this->deleteJson(catalogMediaUrl($item, $medium->id))->assertOk();
        expect(Storage::disk('public')->exists($path))->toBeFalse()->and($item->media()->count())->toBe(0);
    });

    it('refuses anonymous callers, branches and barbers, and an unknown item', function (): void {
        $item = ServiceCatalogItemModel::factory()->create();
        $file = ['file' => UploadedFile::fake()->image('a.png')];

        $this->postJson(catalogMediaUrl($item))->assertUnauthorized();
        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->post(catalogMediaUrl($item), $file, ['Accept' => 'application/json'])->assertForbidden();
        }

        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->post('/api/v1/dashboard/admin/catalog-items/'.fake()->uuid().'/media', $file, ['Accept' => 'application/json'])->assertNotFound();

        expect(Storage::disk('public')->allFiles())->toBe([]);
    });
});
