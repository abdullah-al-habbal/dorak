<?php

declare(strict_types=1);

use Database\Seeders\E2eDashboardSeeder;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Payout\Models\PayoutModel;
use Modules\Review\Models\ReviewModel;
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

    it('creates the brand with the seeded owner and currency, not random factory ones', function (): void {
        $this->seed(E2eDashboardSeeder::class);

        $brand = BranchModel::query()->where('email', E2eDashboardSeeder::MANAGER_EMAIL)->firstOrFail()->brand;

        expect(CurrencyModel::query()->pluck('code')->all())->toBe(['USD'])
            ->and($brand->base_currency_code)->toBe('USD')
            ->and($brand->owner_id)->toBe(ClientModel::query()->where('email', E2eDashboardSeeder::OWNER_EMAIL)->value('id'));
    });

    it('adds no clients on a reset and credits each review to its booking client', function (): void {
        $this->seed(E2eDashboardSeeder::class);
        $clients = ClientModel::withTrashed()->count();

        $this->seed(E2eDashboardSeeder::class);
        $this->seed(E2eDashboardSeeder::class);

        expect(ClientModel::withTrashed()->count())->toBe($clients);
        ReviewModel::query()->get()->each(function (ReviewModel $review): void {
            expect($review->author_id)->toBe(BookingModel::query()->findOrFail($review->booking_id)->client_id);
        });
    });

    it('restores the stylist status, the service flag and the seeded chairs on reset', function (): void {
        $this->seed(E2eDashboardSeeder::class);
        $branch = BranchModel::query()->where('email', E2eDashboardSeeder::MANAGER_EMAIL)->firstOrFail();
        BarberModel::query()->where('email', 'lina.e2e@dorak.test')->update(['status' => BarberStatusEnum::Enabled->value]);
        OfferedServiceModel::query()->update(['is_active' => false]);
        ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => 'Spec chair']);

        $this->seed(E2eDashboardSeeder::class);

        expect(BarberModel::query()->where('email', 'lina.e2e@dorak.test')->firstOrFail()->status)->toBe(BarberStatusEnum::Disabled)
            ->and(OfferedServiceModel::query()->where('serviceable_id', $branch->brand_id)->pluck('is_active')->unique()->all())->toBe([true])
            ->and(ChairModel::query()->where('branch_id', $branch->id)->orderBy('label')->pluck('label')->all())->toBe(['Chair 1', 'Chair 2']);
    });

    it('keeps the previous baseline when a reset fails part-way', function (): void {
        $this->seed(E2eDashboardSeeder::class);
        BarberModel::query()->where('email', 'lina.e2e@dorak.test')->update(['status' => BarberStatusEnum::Enabled->value]);
        PayoutModel::creating(fn (): never => throw new RuntimeException('Simulated reseed failure.'));

        expect(fn () => $this->seed(E2eDashboardSeeder::class))->toThrow(RuntimeException::class, 'Simulated reseed failure.')
            ->and(BarberModel::query()->where('email', 'lina.e2e@dorak.test')->firstOrFail()->status)->toBe(BarberStatusEnum::Enabled)
            ->and(PayoutModel::query()->count())->toBe(4);
    });
});
