<?php

declare(strict_types=1);

use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberPortfolioPhotoModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('slug generation', function (): void {
    it('gives branches and stylists a unique slug from the English name', function (): void {
        $first = BranchModel::factory()->create(['name' => ['en' => 'Golden Cut', 'ar' => 'القصة الذهبية']]);
        $second = BranchModel::factory()->create(['name' => ['en' => 'Golden Cut', 'ar' => 'القصة الذهبية']]);
        $stylist = BarberModel::factory()->create(['name' => ['en' => 'Omar Ali', 'ar' => 'عمر علي']]);
        $other = BarberModel::factory()->create(['name' => ['en' => 'Omar Ali', 'ar' => 'عمر علي']]);

        expect($first->slug)->toBe('golden-cut')
            ->and($second->slug)->toBe('golden-cut-2')
            ->and($stylist->slug)->toBe('omar-ali')
            ->and($other->slug)->toBe('omar-ali-2');
    });

    it('falls back to a generic slug when the name has no usable letters', function (): void {
        expect(BranchModel::factory()->create(['name' => ['en' => '***', 'ar' => '***']])->slug)->toBe('branch')
            ->and(BarberModel::factory()->create(['name' => ['en' => '***', 'ar' => '***']])->slug)->toBe('stylist');
    });
});

describe('public brand profile', function (): void {
    it('shows an active brand with only its discoverable branches and no owner or status data', function (): void {
        $brand = BrandModel::factory()->create(['name' => ['en' => 'Royal Cuts', 'ar' => 'رويال'], 'description' => ['en' => 'Barbers', 'ar' => 'حلاقون']]);
        BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Downtown', 'ar' => 'وسط المدينة']]);
        BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Disabled]);

        $response = $this->getJson('/api/v1/public/brands/royal-cuts')->assertOk();

        expect($response->json('data.slug'))->toBe('royal-cuts')
            ->and($response->json('data.name.ar'))->toBe('رويال')
            ->and($response->json('data.branches'))->toHaveCount(1)
            ->and($response->json('data.branches.0.slug'))->toBe('downtown')
            ->and($response->json('data'))->not->toHaveKeys(['id', 'owner_id', 'status', 'status_reason', 'features']);
    });

    it('answers 404 for an unknown slug and for a brand that is not active', function (): void {
        BrandModel::factory()->create(['name' => ['en' => 'Hidden', 'ar' => 'مخفي'], 'status' => BrandStatusEnum::Suspended]);

        $this->getJson('/api/v1/public/brands/nothing-here')->assertNotFound();
        $this->getJson('/api/v1/public/brands/hidden')->assertNotFound();
    });
});

describe('public branch profile', function (): void {
    it('shows a discoverable branch without its login email or internal ids', function (): void {
        $brand = BrandModel::factory()->create(['name' => ['en' => 'Royal Cuts', 'ar' => 'رويال']]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Downtown', 'ar' => 'وسط المدينة'], 'email' => 'login@private.test', 'tags' => [['en' => 'Kids', 'ar' => 'أطفال']]]);
        $stylist = BarberModel::factory()->create(['name' => ['en' => 'Sami', 'ar' => 'سامي']]);
        ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $stylist->id]);

        $response = $this->getJson('/api/v1/public/branches/downtown')->assertOk();

        expect($response->json('data.slug'))->toBe('downtown')
            ->and($response->json('data.brand.slug'))->toBe('royal-cuts')
            ->and($response->json('data.stylists.0.slug'))->toBe('sami')
            ->and($response->json('data.tags'))->toBe([['en' => 'Kids', 'ar' => 'أطفال']])
            ->and($response->json('data'))->toHaveKeys(['services', 'opening_hours', 'today_hours'])
            ->and($response->json('data'))->not->toHaveKeys(['id', 'email', 'status', 'brand_id']);
        expect($response->getContent())->not->toContain('login@private.test');
    });

    it('answers 404 when the branch is switched off, its brand is inactive, or the slug is malformed', function (): void {
        BranchModel::factory()->create(['name' => ['en' => 'Closed Shop', 'ar' => 'مغلق'], 'status' => BranchStatusEnum::Disabled]);
        $inactive = BrandModel::factory()->create(['status' => BrandStatusEnum::Suspended]);
        BranchModel::factory()->create(['brand_id' => $inactive->id, 'name' => ['en' => 'Orphan', 'ar' => 'يتيم']]);

        $this->getJson('/api/v1/public/branches/closed-shop')->assertNotFound();
        $this->getJson('/api/v1/public/branches/orphan')->assertNotFound();
        $this->getJson('/api/v1/public/branches/Not_A_Slug')->assertNotFound();
    });
});

describe('public stylist profile', function (): void {
    it('shows a discoverable stylist with portfolio and workplaces but no contact data or location', function (): void {
        $stylist = BarberModel::factory()->create([
            'name' => ['en' => 'Sami', 'ar' => 'سامي'],
            'email' => 'sami@private.test',
            'phone' => '+963900000000',
            'latitude' => 33.5138,
            'longitude' => 36.2765,
        ]);
        BarberPortfolioPhotoModel::factory()->create(['barber_id' => $stylist->id, 'image_path' => 'portfolio/one.jpg']);
        $branch = BranchModel::factory()->create(['name' => ['en' => 'Downtown', 'ar' => 'وسط المدينة']]);
        BarberAffiliationModel::factory()->create([
            'barber_id' => $stylist->id,
            'affiliable_type' => AffiliableType::Branch,
            'affiliable_id' => $branch->id,
            'status' => AffiliationStatus::Active,
        ]);

        $response = $this->getJson('/api/v1/public/stylists/sami')->assertOk();

        expect($response->json('data.slug'))->toBe('sami')
            ->and($response->json('data.portfolio'))->toHaveCount(1)
            ->and($response->json('data.workplaces.0'))->toMatchArray(['type' => 'branch', 'slug' => 'downtown'])
            ->and($response->json('data'))->not->toHaveKeys(['id', 'email', 'phone', 'latitude', 'longitude', 'status']);
        expect($response->getContent())->not->toContain('sami@private.test')->not->toContain('+963900000000');
    });

    it('answers 404 for a stylist who is disabled, pending or unknown', function (): void {
        BarberModel::factory()->create(['name' => ['en' => 'Gone', 'ar' => 'ذهب'], 'status' => BarberStatusEnum::Disabled->value]);
        BarberModel::factory()->create(['name' => ['en' => 'Waiting', 'ar' => 'ينتظر'], 'status' => BarberStatusEnum::Pending->value]);

        $this->getJson('/api/v1/public/stylists/gone')->assertNotFound();
        $this->getJson('/api/v1/public/stylists/waiting')->assertNotFound();
        $this->getJson('/api/v1/public/stylists/unknown')->assertNotFound();
    });
});

describe('public service menu', function (): void {
    it('lists services with only the fields a visitor reads, never an id or the brand override data', function (): void {
        $brand = BrandModel::factory()->create();
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Menu Shop', 'ar' => 'قائمة']]);
        $stylist = BarberModel::factory()->create(['name' => ['en' => 'Menu Stylist', 'ar' => 'حلاق']]);
        ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $stylist->id]);
        foreach ([['brand', $brand->id], ['barber', $stylist->id]] as [$type, $ownerId]) {
            OfferedServiceModel::factory()->create(['serviceable_type' => $type, 'serviceable_id' => $ownerId, 'catalog_item_id' => null, 'is_active' => true]);
        }

        $allowed = ['name', 'description', 'price_amount_minor', 'currency_code', 'duration_minutes', 'is_at_home', 'owner'];

        foreach (['/api/v1/public/branches/menu-shop' => 2, '/api/v1/public/stylists/menu-stylist' => 1] as $url => $count) {
            $response = $this->getJson($url)->assertOk();
            $services = $response->json('data.services');

            expect($services)->toHaveCount($count);
            foreach ($services as $service) {
                expect(array_keys($service))->toEqualCanonicalizing($allowed);
            }
            expect($response->getContent())->not->toContain($brand->id)->not->toContain($stylist->id);
        }
    });
});

describe('translatable branch tags', function (): void {
    it('reads each tag in both languages and falls back to the other when one is empty', function (): void {
        $branch = BranchModel::factory()->create(['tags' => [['en' => 'Kids', 'ar' => 'أطفال'], ['en' => 'Beard', 'ar' => '']]]);

        expect($branch->tagTranslations())->toBe([['en' => 'Kids', 'ar' => 'أطفال'], ['en' => 'Beard', 'ar' => '']])
            ->and($branch->localizedTags('ar'))->toBe(['أطفال', 'Beard']);
    });

    it('rejects a tag that is not an en and ar pair', function (): void {
        $branch = BranchModel::factory()->create();

        $this->actingAs($branch, 'branch_api')->patchJson('/api/v1/branch/profile', ['tags' => ['beard']])->assertUnprocessable();
        $this->actingAs($branch, 'branch_api')->patchJson('/api/v1/branch/profile', ['tags' => [['en' => 'beard']]])->assertUnprocessable();
    });
});

describe('public sitemap feed', function (): void {
    it('lists only the profiles the profile endpoints would show, with no ids or private data', function (): void {
        $brand = BrandModel::factory()->create(['name' => ['en' => 'Royal Cuts', 'ar' => 'رويال']]);
        BrandModel::factory()->create(['name' => ['en' => 'Hidden Brand', 'ar' => 'مخفي'], 'status' => BrandStatusEnum::Suspended]);
        BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Downtown', 'ar' => 'وسط']]);
        BranchModel::factory()->create(['brand_id' => $brand->id, 'name' => ['en' => 'Closed Branch', 'ar' => 'مغلق'], 'status' => BranchStatusEnum::Disabled]);
        BarberModel::factory()->create(['name' => ['en' => 'Omar Ali', 'ar' => 'عمر']]);
        BarberModel::factory()->create(['name' => ['en' => 'Off Stylist', 'ar' => 'متوقف'], 'status' => BarberStatusEnum::Disabled]);

        $response = $this->getJson('/api/v1/public/sitemap')->assertOk();

        expect(collect($response->json('data.brands'))->pluck('slug')->all())->toBe(['royal-cuts'])
            ->and(collect($response->json('data.branches'))->pluck('slug')->all())->toBe(['downtown'])
            ->and(collect($response->json('data.stylists'))->pluck('slug')->all())->toBe(['omar-ali'])
            ->and(array_keys($response->json('data.brands.0')))->toBe(['slug', 'updated_at'])
            ->and($response->getContent())->not->toContain($brand->id);
    });

    it('is reachable without authentication and returns empty lists on an empty database', function (): void {
        $this->getJson('/api/v1/public/sitemap')->assertOk()->assertJsonPath('data', ['brands' => [], 'branches' => [], 'stylists' => []]);
    });
});
