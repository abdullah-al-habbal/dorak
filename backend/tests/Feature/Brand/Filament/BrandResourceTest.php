<?php

declare(strict_types=1);

use Filament\Facades\Filament;
use Livewire\Livewire;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Filament\Panels\Admin\Resources\BrandResource\Pages\CreateBrandPage;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;

beforeEach(function () {
    $this->admin = AdminModel::factory()->create();
    $this->actingAs($this->admin, 'admin');
});

it('loads create page', function () {
    $this->get('/admin/brands/create')->assertStatus(200);
});

it('loads view page', function () {
    $brand = BrandModel::factory()->create();

    $this->get("/admin/brands/{$brand->id}")->assertStatus(200);
});

it('loads edit page', function () {
    $brand = BrandModel::factory()->create();

    $this->get("/admin/brands/{$brand->id}/edit")->assertStatus(200);
});

it('loads list page', function () {
    BrandModel::factory()->count(3)->create();

    $this->get('/admin/brands')->assertStatus(200);
});

it('gives a brand created in the admin panel its first branch', function () {
    Filament::setCurrentPanel(Filament::getPanel('admin'));
    $owner = ClientModel::factory()->create();
    $currency = CurrencyModel::factory()->create();

    Livewire::test(CreateBrandPage::class)
        ->fillForm([
            'name' => ['en' => 'Panel Brand', 'ar' => 'علامة اللوحة'],
            'owner_id' => $owner->id,
            'base_currency_id' => $currency->id,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $brand = BrandModel::query()->where('owner_id', $owner->id)->sole();
    expect(BranchModel::query()->where('brand_id', $brand->id)->count())->toBe(1)
        ->and($brand->slug)->toBe('panel-brand');
});
