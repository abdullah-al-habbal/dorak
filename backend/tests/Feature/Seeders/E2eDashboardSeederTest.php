<?php

declare(strict_types=1);

use Database\Seeders\E2eDashboardSeeder;
use Modules\Barber\Models\BarberModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;
use Modules\Subscription\Services\PlanFeatureSyncer;

describe('E2E dashboard seeder', function (): void {
    it('stores stylist names as plain translations', function (): void {
        $this->seed(E2eDashboardSeeder::class);

        $lina = BarberModel::query()->where('email', 'lina.e2e@dorak.test')->firstOrFail();
        $omar = BarberModel::query()->where('email', E2eDashboardSeeder::BARBER_EMAIL)->firstOrFail();

        expect($lina->getTranslations('name'))->toBe(['en' => 'Lina Saad', 'ar' => 'لينا سعد'])
            ->and($omar->getTranslations('name'))->toBe(['en' => 'Omar Haddad', 'ar' => 'عمر حداد']);
    });

    it('stores the owner and booking client names as plain translations', function (): void {
        $this->seed(E2eDashboardSeeder::class);

        $owner = ClientModel::query()->where('email', E2eDashboardSeeder::OWNER_EMAIL)->firstOrFail();
        $client = ClientModel::query()->where('email', 'e2e-client-sami-khoury@dorak.test')->firstOrFail();

        expect($owner->getTranslations('name'))->toBe(['en' => 'E2E Owner', 'ar' => 'مالك الاختبار'])
            ->and($client->getTranslations('name'))->toBe(['en' => 'Sami Khoury', 'ar' => 'سامي خوري']);
    });

    it('keeps the names intact when it runs again', function (): void {
        $this->seed(E2eDashboardSeeder::class);
        $this->seed(E2eDashboardSeeder::class);

        expect(BarberModel::query()->where('email', 'lina.e2e@dorak.test')->firstOrFail()->getTranslation('name', 'en'))->toBe('Lina Saad');
    });

    it('removes a subscription assigned to another brand and revokes its features on reset', function (): void {
        $this->seed(E2eDashboardSeeder::class);
        $seeded = BrandSubscriptionModel::query()->sole();
        $other = BrandModel::factory()->create();
        $plan = SubscriptionPlanModel::query()->findOrFail($seeded->plan_id);
        BrandSubscriptionModel::factory()->create(['brand_id' => $other->id, 'plan_id' => $plan->id]);
        app(PlanFeatureSyncer::class)->grant($other, $plan);

        $this->seed(E2eDashboardSeeder::class);

        expect(BrandSubscriptionModel::query()->pluck('brand_id')->all())->toBe([$seeded->brand_id])
            ->and(app(BrandFeatures::class)->enabled($other->refresh(), BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH))->toBeFalse();
    });
});
