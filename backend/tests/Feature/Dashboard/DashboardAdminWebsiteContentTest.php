<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;
use Modules\Onboarding\Constants\OnboardingMediaConstants;
use Modules\Onboarding\Models\OnboardingConfigurationModel;

const WEBSITE_PAGES = '/api/v1/dashboard/admin/marketing-pages';
const WEBSITE_ONBOARDING = '/api/v1/dashboard/admin/onboarding-configs';

function onboardingConfig(array $overrides = []): OnboardingConfigurationModel
{
    return OnboardingConfigurationModel::create(array_merge([
        'locale' => 'en',
        'season' => null,
        'hero_image_path' => 'assets/images/onboarding/en/default/hero.jpg',
        'is_active' => true,
        'sort_order' => 0,
    ], $overrides));
}

describe('Admin marketing pages', function (): void {
    it('lists every page with its ordered sections, ordered by slug', function (): void {
        $second = websitePage('zeta');
        $first = websitePage('alpha');
        SectionModel::factory()->create(['page_id' => $first->id, 'section_type' => 'hero', 'sort_order' => 2]);
        SectionModel::factory()->create(['page_id' => $first->id, 'section_type' => 'feature_list', 'sort_order' => 1]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $response = $this->getJson(WEBSITE_PAGES)->assertOk();

        expect(collect($response->json('data.pages'))->pluck('slug')->all())->toBe(['alpha', 'zeta'])
            ->and(collect($response->json('data.pages.0.sections'))->pluck('sort_order')->all())->toBe([1, 2])
            ->and($response->json('data.pages.1.id'))->toBe($second->id)
            ->and($response->json('data'))->toHaveKey('testimonials');
    });

    it('saves both titles and meta descriptions and leaves the slug alone', function (): void {
        $page = websitePage('about');
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(WEBSITE_PAGES."/{$page->id}", [
            'title' => ['en' => 'About us', 'ar' => 'من نحن'],
            'meta_description' => ['en' => 'Who we are', 'ar' => 'من نحن'],
            'slug' => 'hijacked',
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'about')
            ->assertJsonPath('data.title.en', 'About us')
            ->assertJsonPath('data.title.ar', 'من نحن');

        $fresh = $page->fresh();
        expect($fresh->slug)->toBe('about')
            ->and($fresh->getTranslation('title', 'en'))->toBe('About us')
            ->and($fresh->getTranslation('meta_description', 'ar'))->toBe('من نحن');
    });

    it('rejects a missing title, an extra locale and an over-long value without changing the page', function (): void {
        $page = websitePage('about');
        $before = $page->getTranslations('title');
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(WEBSITE_PAGES."/{$page->id}", ['title' => ['en' => 'Only English']])->assertUnprocessable()->assertJsonValidationErrors(['title.ar']);
        $this->putJson(WEBSITE_PAGES."/{$page->id}", ['title' => ['en' => 'a', 'ar' => 'b', 'fr' => 'c']])->assertUnprocessable();
        $this->putJson(WEBSITE_PAGES."/{$page->id}", ['title' => ['en' => str_repeat('a', 256), 'ar' => 'b']])->assertUnprocessable()->assertJsonValidationErrors(['title.en']);
        $this->putJson(WEBSITE_PAGES."/{$page->id}", ['title' => ['en' => 'a', 'ar' => 'b'], 'meta_description' => ['en' => str_repeat('a', 501)]])->assertUnprocessable()->assertJsonValidationErrors(['meta_description.en']);

        expect($page->fresh()->getTranslations('title'))->toEqual($before);
    });

    it('answers 404 for an unknown page and refuses non-admin callers', function (): void {
        $page = websitePage('about');
        $payload = ['title' => ['en' => 'a', 'ar' => 'b']];

        $this->getJson(WEBSITE_PAGES)->assertUnauthorized();
        $this->putJson(WEBSITE_PAGES."/{$page->id}", $payload)->assertUnauthorized();

        $this->authenticateDashboardActor(BranchModel::factory()->create());
        $this->getJson(WEBSITE_PAGES)->assertForbidden();
        $this->putJson(WEBSITE_PAGES."/{$page->id}", $payload)->assertForbidden();
        expect($page->fresh()->getTranslation('title', 'en'))->not->toBe('a');

        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->putJson(WEBSITE_PAGES.'/'.fake()->uuid(), $payload)->assertNotFound();
    });
});

describe('Admin onboarding configs', function (): void {
    it('lists the rows ordered by locale, sort order and season, with the image URL', function (): void {
        onboardingConfig(['locale' => 'en', 'season' => 'summer', 'sort_order' => 2]);
        onboardingConfig(['locale' => 'ar', 'season' => null, 'sort_order' => 0]);
        onboardingConfig(['locale' => 'en', 'season' => null, 'sort_order' => 1]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $response = $this->getJson(WEBSITE_ONBOARDING)->assertOk()->assertJsonCount(3, 'data');

        expect(collect($response->json('data'))->map(fn (array $row): string => $row['locale'].':'.($row['season'] ?? 'default'))->all())
            ->toBe(['ar:default', 'en:default', 'en:summer'])
            ->and($response->json('data.0.hero_image_url'))->toContain('assets/images/onboarding/en/default/hero.jpg');
    });

    it('switches a row off and reorders it, and the public config stops serving it', function (): void {
        $row = onboardingConfig(['season' => 'summer', 'hero_image_path' => 'assets/images/onboarding/en/summer/hero.jpg']);
        onboardingConfig();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => false, 'sort_order' => 7])
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.sort_order', 7);

        expect($row->fresh()->is_active)->toBeFalse()->and($row->fresh()->sort_order)->toBe(7);
        $this->withHeaders(['Accept-Language' => 'en'])->getJson('/api/v1/app/onboarding-config?season=summer')
            ->assertOk()
            ->assertJsonPath('data.hero_image_url', fn (string $url): bool => ! str_contains($url, '/summer/'));
    });

    it('cannot change the locale, season or image through the update', function (): void {
        $row = onboardingConfig();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => true, 'locale' => 'ar', 'season' => 'winter', 'hero_image_path' => 'evil.jpg'])->assertOk();

        $fresh = $row->fresh();
        expect($fresh->locale)->toBe('en')->and($fresh->season)->toBeNull()->and($fresh->hero_image_path)->toBe('assets/images/onboarding/en/default/hero.jpg');
    });

    it('rejects a missing flag, a non-boolean flag and an out-of-range order without changing the row', function (): void {
        $row = onboardingConfig(['sort_order' => 3]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['sort_order' => 1])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);
        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => 'maybe'])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);
        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => true, 'sort_order' => -1])->assertUnprocessable()->assertJsonValidationErrors(['sort_order']);
        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => true, 'sort_order' => 100001])->assertUnprocessable()->assertJsonValidationErrors(['sort_order']);

        expect($row->fresh()->sort_order)->toBe(3);
    });

    it('answers 404 for an unknown row and refuses non-admin callers', function (): void {
        $row = onboardingConfig();

        $this->getJson(WEBSITE_ONBOARDING)->assertUnauthorized();
        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => false])->assertUnauthorized();

        $this->authenticateDashboardActor(BranchModel::factory()->create());
        $this->getJson(WEBSITE_ONBOARDING)->assertForbidden();
        $this->putJson(WEBSITE_ONBOARDING."/{$row->id}", ['is_active' => false])->assertForbidden();
        expect($row->fresh()->is_active)->toBeTrue();

        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->putJson(WEBSITE_ONBOARDING.'/'.fake()->uuid(), ['is_active' => false])->assertNotFound();
    });
});

function websitePage(string $slug): MarketingPageModel
{
    return MarketingPageModel::factory()->create(['slug' => $slug]);
}

describe('Admin onboarding hero upload (FT-13)', function (): void {
    beforeEach(function (): void {
        Storage::fake('public');
    });

    it('replaces the hero, keeps a seeded file and deletes an earlier upload', function (): void {
        $row = onboardingConfig();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        Storage::disk('public')->put($row->hero_image_path, 'seeded');

        $first = $this->post(WEBSITE_ONBOARDING."/{$row->id}/image", ['file' => UploadedFile::fake()->image('a.png', 100, 100)], ['Accept' => 'application/json'])->assertOk();
        $firstPath = $row->refresh()->hero_image_path;
        expect($firstPath)->toStartWith(OnboardingMediaConstants::ONBOARDING_MEDIA_DIRECTORY.'/')
            ->and($first->json('data.hero_image_url'))->toBe(Storage::disk('public')->url($firstPath))
            ->and(Storage::disk('public')->exists('assets/images/onboarding/en/default/hero.jpg'))->toBeTrue();

        $this->post(WEBSITE_ONBOARDING."/{$row->id}/image", ['file' => UploadedFile::fake()->image('b.jpg', 100, 100)], ['Accept' => 'application/json'])->assertOk();

        expect(Storage::disk('public')->exists($firstPath))->toBeFalse()
            ->and(Storage::disk('public')->allFiles(OnboardingMediaConstants::ONBOARDING_MEDIA_DIRECTORY))->toHaveCount(1);
    });

    it('refuses a script, an svg, a heavy or an oversized image and keeps the old hero', function (UploadedFile $file): void {
        $row = onboardingConfig();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->post(WEBSITE_ONBOARDING."/{$row->id}/image", ['file' => $file], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        expect($row->refresh()->hero_image_path)->toBe('assets/images/onboarding/en/default/hero.jpg')->and(Storage::disk('public')->allFiles())->toBe([]);
    })->with([
        'a script' => [fn () => UploadedFile::fake()->createWithContent('a.png', '<?php echo 1;')],
        'an svg' => [fn () => UploadedFile::fake()->createWithContent('a.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
        'too heavy' => [fn () => UploadedFile::fake()->image('a.png')->size(OnboardingMediaConstants::ONBOARDING_MEDIA_MAX_KB + 1)],
        'too wide' => [fn () => UploadedFile::fake()->image('a.png', OnboardingMediaConstants::ONBOARDING_MEDIA_MAX_SIDE + 1, 10)],
    ]);

    it('refuses anonymous callers and non-admins, and an unknown screen', function (): void {
        $row = onboardingConfig();
        $file = ['file' => UploadedFile::fake()->image('a.png')];

        $this->postJson(WEBSITE_ONBOARDING."/{$row->id}/image")->assertUnauthorized();
        $this->authenticateDashboardActor(BranchModel::factory()->create());
        $this->post(WEBSITE_ONBOARDING."/{$row->id}/image", $file, ['Accept' => 'application/json'])->assertForbidden();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->post(WEBSITE_ONBOARDING.'/'.fake()->uuid().'/image', $file, ['Accept' => 'application/json'])->assertNotFound();

        expect(Storage::disk('public')->allFiles())->toBe([]);
    });
});
