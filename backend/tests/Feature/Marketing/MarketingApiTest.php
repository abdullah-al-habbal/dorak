<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;

it('returns a localized marketing page with its visible sections', function () {
    $page = MarketingPageModel::factory()->create([
        'slug' => 'barber-tools',
        'title' => ['en' => 'Barber tools', 'ar' => 'أدوات الحلاق'],
    ]);
    SectionModel::factory()->create([
        'page_id' => $page->id,
        'universe_visibility' => 'all',
        'body' => ['en' => ['heading' => 'Run your shop'], 'ar' => ['heading' => 'أدر صالونك']],
    ]);

    $response = $this->getJson('/api/v1/marketing/pages/barber-tools?universe=all', [
        'Accept-Language' => 'en',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.page.slug', 'barber-tools')
        ->assertJsonPath('data.page.title', 'Barber tools')
        ->assertJsonCount(1, 'data.sections')
        ->assertJsonPath('data.sections.0.body.heading', 'Run your shop');
});

it('returns the configured floor plan demo and its chairs', function () {
    $branch = BranchModel::factory()->create([
        'email' => 'demo@dorak.sy',
        'name' => ['en' => 'Demo branch', 'ar' => 'الفرع التجريبي'],
    ]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => 'A1']);

    $response = $this->getJson('/api/v1/website/floor-plan-demo');

    $response->assertOk()
        ->assertJsonPath('data.branch.id', $branch->id)
        ->assertJsonPath('data.chairs.0.id', $chair->id)
        ->assertJsonPath('data.chairs.0.label', 'A1');
});
