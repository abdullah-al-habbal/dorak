<?php

declare(strict_types=1);

use Modules\Marketing\Database\Seeders\MarketingPageSeeder;
use Modules\Marketing\Database\Seeders\SectionSeeder;
use Modules\Marketing\Enums\SectionTypeEnum;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;

beforeEach(fn () => config(['app.url' => 'https://dorak.test']));

function legalPage(string $slug, bool $published = true): MarketingPageModel
{
    $page = MarketingPageModel::factory()->create([
        'slug' => $slug,
        'title' => ['en' => 'Privacy Policy', 'ar' => 'سياسة الخصوصية'],
        'meta_description' => ['en' => 'How we protect data.', 'ar' => 'كيف نحمي البيانات.'],
        'published_at' => $published ? now()->subMinute() : null,
    ]);
    SectionModel::factory()->create([
        'page_id' => $page->id,
        'section_type' => SectionTypeEnum::LegalText->value,
        'universe_visibility' => 'all',
        'body' => [
            'en' => ['heading' => 'Your data', 'paragraphs' => ['We keep it safe.', '<script>alert(1)</script>']],
            'ar' => ['heading' => 'بياناتك', 'paragraphs' => ['نحافظ عليها.']],
        ],
    ]);

    return $page;
}

it('renders a published legal page in each language with canonical, alternates and open graph tags', function (string $locale, string $dir, string $heading) {
    legalPage('privacy');

    $this->get("/{$locale}/privacy")
        ->assertOk()
        ->assertSee("lang=\"{$locale}\" dir=\"{$dir}\"", false)
        ->assertSee($heading)
        ->assertSee('<link rel="canonical" href="https://dorak.test/'.$locale.'/privacy">', false)
        ->assertSee('<link rel="alternate" hreflang="en" href="https://dorak.test/en/privacy">', false)
        ->assertSee('<link rel="alternate" hreflang="ar" href="https://dorak.test/ar/privacy">', false)
        ->assertSee('<link rel="alternate" hreflang="x-default" href="https://dorak.test/ar/privacy">', false)
        ->assertSee('<meta property="og:url" content="https://dorak.test/'.$locale.'/privacy">', false);
})->with([
    'english' => ['en', 'ltr', 'Your data'],
    'arabic' => ['ar', 'rtl', 'بياناتك'],
]);

it('escapes the page text', function () {
    legalPage('privacy');

    $this->get('/en/privacy')->assertOk()->assertDontSee('<script>alert(1)</script>', false);
});

it('does not show a draft or a scheduled page on the site or in the public api', function () {
    legalPage('terms', published: false);
    MarketingPageModel::factory()->create(['slug' => 'about', 'published_at' => now()->addDay()]);

    $this->get('/en/terms')->assertNotFound();
    $this->get('/en/about')->assertNotFound();
    $this->getJson('/api/v1/marketing/pages/terms?universe=all')->assertNotFound();
    $this->getJson('/api/v1/marketing/pages/about?universe=all')->assertNotFound();
});

it('serves the public api for a published page', function () {
    legalPage('privacy');

    $this->getJson('/api/v1/marketing/pages/privacy?universe=all', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.page.slug', 'privacy');
});

it('answers unknown pages and unsupported languages with 404', function () {
    $this->get('/en/not-a-page')->assertNotFound();
    $this->get('/fr/privacy')->assertNotFound();
});

it('keeps the unprefixed marketing pages working and fixes the footer links', function () {
    MarketingPageModel::factory()->create(['slug' => 'features']);
    MarketingPageModel::factory()->create(['slug' => 'pricing']);
    MarketingPageModel::factory()->create(['slug' => 'home']);

    $this->get('/features')->assertOk();
    $this->get('/en/features')->assertOk()->assertSee('href="/en/privacy"', false)->assertSee('href="/en/delete-account"', false);
    $this->get('/en/pricing')->assertOk();
    $this->get('/ar')->assertOk();
});

it('lists only published pages, in both languages with alternates, in the sitemap', function () {
    legalPage('privacy');
    legalPage('terms', published: false);
    MarketingPageModel::factory()->create(['slug' => 'home']);

    $response = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $xml = $response->getContent();

    expect($xml)->toContain('<loc>https://dorak.test/en/privacy</loc>')
        ->toContain('<loc>https://dorak.test/ar/privacy</loc>')
        ->toContain('<loc>https://dorak.test/en</loc>')
        ->toContain('hreflang="x-default" href="https://dorak.test/ar/privacy"')
        ->not->toContain('/terms');
    expect(simplexml_load_string($xml))->not->toBeFalse();
});

it('serves robots.txt that hides the api and points to the sitemap on the configured domain', function () {
    $this->get('/robots.txt')->assertOk()
        ->assertSee('Disallow: /api/')
        ->assertSee('Sitemap: https://dorak.test/sitemap.xml');
});

it('seeds the legal pages as drafts and the marketing pages as published', function () {
    $this->seed(MarketingPageSeeder::class);
    $this->seed(SectionSeeder::class);

    foreach (['privacy', 'terms', 'about', 'contact', 'delete-account'] as $slug) {
        $page = MarketingPageModel::query()->where('slug', $slug)->firstOrFail();
        expect($page->isPublished())->toBeFalse()
            ->and($page->sections()->count())->toBe(1);
    }
    foreach (['home', 'features', 'pricing'] as $slug) {
        expect(MarketingPageModel::query()->where('slug', $slug)->firstOrFail()->isPublished())->toBeTrue();
    }
});
