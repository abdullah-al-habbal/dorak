<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Models\CurrencyModel;

const OWNER_BRANDS_URL = '/api/v1/dashboard/brands';

/** @return array{owner: ClientModel, brand: BrandModel} */
function ownerBrandsPair(BrandStatusEnum $status = BrandStatusEnum::Active, array $brand = []): array
{
    $owner = ClientModel::factory()->create();

    return ['owner' => $owner, 'brand' => BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $status, ...$brand])];
}

function ownerBrandsPayload(array $overrides = []): array
{
    return [
        'name' => ['en' => 'Fresh Cuts', 'ar' => 'قصات طازجة'],
        'base_currency_code' => CurrencyModel::factory()->create()->code,
        ...$overrides,
    ];
}

/** NS-13: the owner's own brands, listed, read, created and edited from the dashboard. */
describe('Owner brand list and detail (NS-13)', function (): void {
    it('lists only the signed-in owner\'s brands with status, currency and branch count', function (): void {
        ['owner' => $owner, 'brand' => $mine] = ownerBrandsPair();
        BranchModel::factory()->count(2)->create(['brand_id' => $mine->id]);
        $pending = BrandModel::factory()->pending()->create(['owner_id' => $owner->id]);
        BrandModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $response = $this->getJson(OWNER_BRANDS_URL)->assertOk();

        $rows = collect($response->json('data'))->keyBy('id');
        expect($rows->keys()->all())->toEqualCanonicalizing([$mine->id, $pending->id])
            ->and($rows[$mine->id]['branches_count'])->toBe(2)
            ->and($rows[$pending->id]['status'])->toBe('pending')
            ->and($rows[$mine->id]['base_currency']['code'])->toBe($mine->base_currency_code);
    });

    it('filters by status and name and never reaches another owner\'s brand through them', function (): void {
        ['owner' => $owner, 'brand' => $active] = ownerBrandsPair(brand: ['name' => ['en' => 'Alpha Cuts', 'ar' => 'ألفا']]);
        $pending = BrandModel::factory()->pending()->create(['owner_id' => $owner->id, 'name' => ['en' => 'Beta Cuts', 'ar' => 'بيتا']]);
        BrandModel::factory()->create(['name' => ['en' => 'Alpha Foreign', 'ar' => 'غريب']]);
        $this->authenticateDashboardActor($owner);
        $ids = fn (string $query): array => collect($this->getJson(OWNER_BRANDS_URL.$query)->assertOk()->json('data'))->pluck('id')->all();

        expect($ids('?status=pending'))->toBe([$pending->id])
            ->and($ids('?search=Alpha'))->toBe([$active->id])
            ->and($ids('?search=%25'))->toBe([]);
        $this->getJson(OWNER_BRANDS_URL.'?status=ghost')->assertUnprocessable()->assertJsonValidationErrors('status');
    });

    it('shows an owned brand and answers 404 for another owner\'s brand and an unknown id, and 403 for a manager', function (): void {
        ['owner' => $owner, 'brand' => $brand] = ownerBrandsPair();
        $foreign = BrandModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $this->getJson(OWNER_BRANDS_URL."/{$brand->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $brand->id)
            ->assertJsonPath('data.max_submissions', 3);
        $this->getJson(OWNER_BRANDS_URL."/{$foreign->id}")->assertNotFound();
        $this->getJson(OWNER_BRANDS_URL.'/00000000-0000-4000-8000-0000000000b1')->assertNotFound();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(BranchModel::factory()->create(['brand_id' => $brand->id]));
        $this->getJson(OWNER_BRANDS_URL."/{$brand->id}")->assertForbidden();
    });
});

describe('Add a brand as an owner (NS-13)', function (): void {
    it('creates a pending brand owned by the caller with its first branch', function (): void {
        ['owner' => $owner] = ownerBrandsPair();
        $this->authenticateDashboardActor($owner);

        $response = $this->postJson(OWNER_BRANDS_URL, ownerBrandsPayload(['description' => ['en' => 'Best cuts', 'ar' => 'أفضل']]))
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.branches_count', 1)
            ->assertJsonPath('data.description.en', 'Best cuts');

        $brand = BrandModel::query()->findOrFail($response->json('data.id'));
        expect($brand->owner_id)->toBe($owner->id)
            ->and($brand->status)->toBe(BrandStatusEnum::Pending)
            ->and($brand->universe)->toBe(VenueUniverse::Unisex)
            ->and($brand->branches()->sole()->status)->toBe(BranchStatusEnum::Pending);
    });

    it('lets one owner hold several brands and uses the first-branch names and universe when given', function (): void {
        ['owner' => $owner] = ownerBrandsPair();
        $this->authenticateDashboardActor($owner);

        $this->postJson(OWNER_BRANDS_URL, ownerBrandsPayload([
            'universe' => VenueUniverse::Women->value,
            'first_branch' => ['name' => ['en' => 'Mall', 'ar' => 'المول'], 'latitude' => 31.95, 'longitude' => 35.91],
        ]))->assertCreated()->assertJsonPath('data.universe', 'women');

        expect(BrandModel::query()->where('owner_id', $owner->id)->count())->toBe(2)
            ->and(BranchModel::query()->where('latitude', 31.95)->sole()->getTranslation('name', 'en'))->toBe('Mall');
    });

    it('validates names, currency, logo, universe and the first branch', function (array $payload, string $field): void {
        ['owner' => $owner] = ownerBrandsPair();
        $this->authenticateDashboardActor($owner);
        $base = ownerBrandsPayload();
        BranchModel::factory()->create(['email' => 'taken@example.com']);

        $this->postJson(OWNER_BRANDS_URL, array_replace_recursive($base, $payload))->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(BrandModel::query()->where('owner_id', $owner->id)->count())->toBe(1);
    })->with([
        'missing english name' => [['name' => ['en' => null]], 'name.en'],
        'missing arabic name' => [['name' => ['ar' => null]], 'name.ar'],
        'unknown currency' => [['base_currency_code' => 'ZZZ'], 'base_currency_code'],
        'bad logo url' => [['logo_url' => 'not a url'], 'logo_url'],
        'unknown universe' => [['universe' => 'kids'], 'universe'],
        'latitude without longitude' => [['first_branch' => ['latitude' => 31.9]], 'first_branch.longitude'],
        'latitude out of range' => [['first_branch' => ['latitude' => 95, 'longitude' => 35]], 'first_branch.latitude'],
        'taken branch email' => [['first_branch' => ['email' => 'taken@example.com', 'password' => 'long-enough-pass']], 'first_branch.email'],
        'email without password' => [['first_branch' => ['email' => 'new@example.com']], 'first_branch.password'],
        'short branch password' => [['first_branch' => ['email' => 'new@example.com', 'password' => 'short']], 'first_branch.password'],
    ]);

    it('refuses the platform admin, a manager and a barber, and anonymous callers', function (): void {
        $this->postJson(OWNER_BRANDS_URL, ownerBrandsPayload())->assertUnauthorized();

        $actors = [AdminModel::factory()->create(), BranchModel::factory()->create(), BarberModel::factory()->create()];
        $payload = ownerBrandsPayload();
        $brandsBefore = BrandModel::query()->count();
        foreach ($actors as $actor) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            expect($this->postJson(OWNER_BRANDS_URL, $payload)->status())->toBe(403);
        }

        expect(BrandModel::query()->count())->toBe($brandsBefore);
    });
});

describe('Edit a brand as an owner (NS-13)', function (): void {
    it('updates the names, description and currency and leaves owner and status alone', function (): void {
        ['owner' => $owner, 'brand' => $brand] = ownerBrandsPair();
        $currency = CurrencyModel::factory()->create();
        $this->authenticateDashboardActor($owner);

        $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", [
            'name' => ['en' => 'Renamed', 'ar' => 'جديد'],
            'description' => ['en' => 'New text', 'ar' => 'نص'],
            'base_currency_code' => $currency->code,
            'owner_id' => ClientModel::factory()->create()->id,
            'status' => 'suspended',
        ])->assertOk()->assertJsonPath('data.name.en', 'Renamed');

        expect($brand->fresh())
            ->owner_id->toBe($owner->id)
            ->status->toBe(BrandStatusEnum::Active)
            ->base_currency_code->toBe($currency->code);
    });

    it('lets a rejected or pending brand be fixed before resubmitting', function (BrandStatusEnum $status): void {
        ['owner' => $owner, 'brand' => $brand] = ownerBrandsPair($status);
        $this->authenticateDashboardActor($owner);

        $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", ['name' => ['en' => 'Fixed']])->assertOk();

        expect($brand->fresh()->getTranslation('name', 'en'))->toBe('Fixed');
    })->with([BrandStatusEnum::Rejected, BrandStatusEnum::Pending]);

    it('validates the edit', function (array $payload, string $field): void {
        ['owner' => $owner, 'brand' => $brand] = ownerBrandsPair();
        $this->authenticateDashboardActor($owner);

        $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
    })->with([
        'long name' => [['name' => ['en' => str_repeat('a', 256)]], 'name.en'],
        'unknown currency' => [['base_currency_code' => 'ZZZ'], 'base_currency_code'],
        'bad logo' => [['logo_url' => 'nope'], 'logo_url'],
        'unknown universe' => [['universe' => 'kids'], 'universe'],
    ]);

    it('refuses another owner, a manager of another brand and a barber, and lets the admin edit any brand', function (): void {
        ['brand' => $brand] = ownerBrandsPair();
        $payload = ['name' => ['en' => 'Hijacked']];
        $stranger = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $stranger->id]);

        $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", $payload)->assertUnauthorized();
        $seen = [];
        foreach ([$stranger, BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            $seen[] = $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", $payload)->status();
        }
        expect($seen)->toBe([403, 403, 403]);
        expect($brand->fresh()->getTranslation('name', 'en'))->not->toBe('Hijacked');

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->putJson(OWNER_BRANDS_URL."/{$brand->id}", ['name' => ['en' => 'Admin edit']])->assertOk();
        expect($brand->fresh()->getTranslation('name', 'en'))->toBe('Admin edit');
    });
});

/** FT-9: the logo is uploaded first, then its URL goes into the brand payload. */
describe('Brand logo upload (FT-9)', function (): void {
    beforeEach(function (): void {
        Storage::fake('public');
    });

    it('stores a logo for an owner and returns its public URL', function (): void {
        $this->authenticateDashboardActor(ownerBrandsPair()['owner']);

        $response = $this->post(OWNER_BRANDS_URL.'/logo', ['file' => UploadedFile::fake()->image('logo.png', 200, 200)], ['Accept' => 'application/json'])
            ->assertCreated();

        $files = Storage::disk('public')->allFiles('brand-logos');
        expect($files)->toHaveCount(1)
            ->and($response->json('data.url'))->toBe(Storage::disk('public')->url($files[0]))
            ->and($files[0])->not->toContain('logo.png');
    });

    it('refuses what is not a small raster image', function (UploadedFile $file): void {
        $this->authenticateDashboardActor(ownerBrandsPair()['owner']);

        $this->post(OWNER_BRANDS_URL.'/logo', ['file' => $file], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        expect(Storage::disk('public')->allFiles())->toBe([]);
    })->with([
        'a script' => [fn () => UploadedFile::fake()->createWithContent('logo.png', '<?php echo 1;')],
        'an svg' => [fn () => UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
        'too heavy' => [fn () => UploadedFile::fake()->image('logo.png')->size(2049)],
        'too wide' => [fn () => UploadedFile::fake()->image('logo.png', 4097, 10)],
    ]);

    it('refuses a missing file, anonymous callers, managers and barbers', function (): void {
        $this->postJson(OWNER_BRANDS_URL.'/logo')->assertUnauthorized();

        $this->authenticateDashboardActor(ownerBrandsPair()['owner']);
        $this->postJson(OWNER_BRANDS_URL.'/logo')->assertUnprocessable()->assertJsonValidationErrors('file');

        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->post(OWNER_BRANDS_URL.'/logo', ['file' => UploadedFile::fake()->image('logo.png')], ['Accept' => 'application/json'])->assertForbidden();
        }

        expect(Storage::disk('public')->allFiles())->toBe([]);
    });
});
