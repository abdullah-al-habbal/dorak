<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\Subscription\Enums\SubscriptionStatus;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\PlanFeatureModel;
use Modules\Subscription\Models\SubscriptionPlanModel;
use Modules\Subscription\Services\PlanFeatureSyncer;

/**
 * Deterministic data for the dashboard Playwright suite (frontend/web/dashboard/tests/e2e).
 * Idempotent: running it again restores the baseline (no saved working hours, today's two
 * bookings) so specs can reset the real backend between tests. Dev/test databases only.
 */
final class E2eDashboardSeeder extends Seeder
{
    public const string MANAGER_EMAIL = 'e2e-manager@dorak.test';

    public const string MANAGER_PASSWORD = 'e2e-password-123';

    public const string OWNER_EMAIL = 'e2e-owner@dorak.test';

    public const string OWNER_PASSWORD = 'e2e-password-123';

    public function run(): void
    {
        $currency = CurrencyModel::query()->firstOrCreate(
            ['code' => 'USD'],
            ['name' => ['en' => 'US dollar', 'ar' => 'دولار أمريكي'], 'symbol' => '$', 'is_default' => true],
        );

        $branch = $this->branch();
        $this->restoreBranchBaseline($branch);
        $chairs = [$this->chair($branch, 'Chair 1'), $this->chair($branch, 'Chair 2')];

        DB::table('branch_opening_hours')->where('branch_id', $branch->id)->delete();

        $omar = $this->stylist('omar.e2e@dorak.test', 'Omar Haddad', 'عمر حداد', BarberStatusEnum::Enabled, $chairs[0]);
        $lina = $this->stylist('lina.e2e@dorak.test', 'Lina Saad', 'لينا سعد', BarberStatusEnum::Disabled, $chairs[1]);

        $haircut = $this->service($branch, $currency, 'Hair', 'الشعر', 'Classic haircut', 'قص كلاسيكي', 2500, 30);
        $beard = $this->service($branch, $currency, 'Beard', 'اللحية', 'Beard trim', 'تشذيب اللحية', 1500, 20);

        BookingModel::query()->where('branch_id', $branch->id)->delete();
        $this->booking($chairs[0], $omar, $haircut, 'Sami Khoury', 'سامي خوري', 10, BookingStatus::Confirmed);
        $this->booking($chairs[1], $lina, $beard, 'Nadia Farah', 'نادية فرح', 14, BookingStatus::Pending);

        // Completed history for the earnings screen: this month and the 30 days before it.
        foreach ([1, 2, 4, 5, 8, 12, 20] as $daysAgo) {
            $this->booking($chairs[0], $omar, $haircut, 'Past Client '.$daysAgo, 'عميل '.$daysAgo, 11, BookingStatus::Completed, $daysAgo);
        }
        $this->booking($chairs[1], $lina, $beard, 'Older Client', 'عميل قديم', 11, BookingStatus::Completed, 40);

        $this->reviews($branch);
        $this->ownerBilling($branch->brand, $currency);
    }

    /** Three counted reviews (5, 4, 2 stars: average 3.67) and one disputed review that stays out of the summary. */
    private function reviews(BranchModel $branch): void
    {
        ReviewModel::query()->where('subject_id', $branch->id)->where('subject_type', ReviewSubjectTypeEnum::Branch)->delete();

        $rows = [
            [5, 'Excellent cut and a friendly team.', ReviewStatus::Published],
            [4, 'Clean shop, short wait.', ReviewStatus::Published],
            [2, 'Waited too long for my turn.', ReviewStatus::Published],
            [1, 'Disputed by the branch.', ReviewStatus::Disputed],
        ];
        // Reuse the seeded completed bookings: the factory's own booking would create random currencies.
        $bookingIds = BookingModel::query()->where('branch_id', $branch->id)->where('booking_status', BookingStatus::Completed)->orderBy('id')->pluck('id');
        foreach ($rows as $index => [$rating, $body, $status]) {
            ReviewModel::factory()->create([
                'booking_id' => $bookingIds[$index],
                'subject_type' => ReviewSubjectTypeEnum::Branch,
                'subject_id' => $branch->id,
                'rating' => $rating,
                'body' => $body,
                'status' => $status,
            ]);
        }
    }

    /** The brand owner (dashboard actor `owner`) with an active plan and payouts in every visible status plus one hidden draft. */
    private function ownerBilling(BrandModel $brand, CurrencyModel $currency): void
    {
        $owner = ClientModel::query()->firstOrCreate(
            ['email' => self::OWNER_EMAIL],
            ClientModel::factory()->make(['email' => self::OWNER_EMAIL, 'name' => ['en' => 'E2E Owner', 'ar' => 'مالك الاختبار'], 'password' => Hash::make(self::OWNER_PASSWORD)])->getAttributes(),
        );
        $brand->update(['owner_id' => $owner->id]);

        BrandSubscriptionModel::query()->where('brand_id', $brand->id)->delete();
        $plan = SubscriptionPlanModel::query()->firstOrCreate(
            ['price_amount_minor' => 4900, 'currency_code' => $currency->code, 'sort_order' => 99],
            SubscriptionPlanModel::factory()->make(['name' => ['en' => 'E2E Growth', 'ar' => 'نمو الاختبار'], 'description' => ['en' => 'For growing brands.', 'ar' => 'للعلامات النامية.'], 'price_amount_minor' => 4900, 'currency_code' => $currency->code, 'sort_order' => 99])->getAttributes(),
        );
        PlanFeatureModel::query()->firstOrCreate(['plan_id' => $plan->id, 'feature_key' => 'multi_branch']);
        BrandSubscriptionModel::factory()->create(['brand_id' => $brand->id, 'plan_id' => $plan->id, 'status' => SubscriptionStatus::Active]);
        // A real subscription change syncs the plan's features to the brand's flags; the factory does not.
        app(PlanFeatureSyncer::class)->grant($brand, $plan);

        PayoutModel::query()->where('brand_id', $brand->id)->delete();
        $rows = [[PayoutStatus::Paid, 125000, 3], [PayoutStatus::Approved, 84050, 2], [PayoutStatus::Cancelled, 20000, 1], [PayoutStatus::Draft, 99900, 0]];
        foreach ($rows as [$status, $amount, $daysAgo]) {
            PayoutModel::factory()->create([
                'brand_id' => $brand->id,
                'currency_code' => $currency->code,
                'status' => $status,
                'total_amount_minor' => $amount,
                'paid_at' => $status === PayoutStatus::Paid ? now()->subDays($daysAgo) : null,
                'external_reference' => $status === PayoutStatus::Paid ? 'E2E-REF-1' : null,
                'created_at' => now()->subDays($daysAgo),
            ]);
        }
    }

    private function branch(): BranchModel
    {
        $existing = BranchModel::query()->where('email', self::MANAGER_EMAIL)->first();
        if ($existing !== null) {
            return $existing;
        }

        $brand = BrandModel::factory()->create(['status' => BrandStatusEnum::Active->value]);

        return BranchModel::factory()->create([
            'brand_id' => $brand->id,
            'name' => ['en' => 'E2E Salon', 'ar' => 'صالون الاختبار'],
            'email' => self::MANAGER_EMAIL,
            'password' => Hash::make(self::MANAGER_PASSWORD),
        ]);
    }

    /** Undoes what the branches spec does: a renamed or disabled seeded branch and any extra branch it created. */
    private function restoreBranchBaseline(BranchModel $branch): void
    {
        $branch->update([
            'name' => ['en' => 'E2E Salon', 'ar' => 'صالون الاختبار'],
            'status' => BranchStatusEnum::Enabled->value,
        ]);
        BranchModel::query()->where('brand_id', $branch->brand_id)->whereKeyNot($branch->id)->get()->each->delete();
    }

    private function chair(BranchModel $branch, string $label): ChairModel
    {
        return ChairModel::query()->firstWhere(['branch_id' => $branch->id, 'label' => $label])
            ?? ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => $label]);
    }

    private function stylist(string $email, string $en, string $ar, BarberStatusEnum $status, ChairModel $chair): BarberModel
    {
        $barber = BarberModel::query()->firstOrCreate(
            ['email' => $email],
            BarberModel::factory()->make(['email' => $email, 'name' => ['en' => $en, 'ar' => $ar], 'status' => $status->value])->getAttributes(),
        );
        $chair->update(['barber_id' => $barber->id]);

        return $barber;
    }

    private function service(
        BranchModel $branch,
        CurrencyModel $currency,
        string $categoryEn,
        string $categoryAr,
        string $nameEn,
        string $nameAr,
        int $priceMinor,
        int $minutes,
    ): OfferedServiceModel {
        $category = ServiceCatalogCategoryModel::query()->firstOrCreate(
            ['slug' => 'e2e-'.strtolower($categoryEn)],
            ['name' => ['en' => $categoryEn, 'ar' => $categoryAr], 'is_active' => true],
        );

        return OfferedServiceModel::query()->firstOrCreate(
            ['serviceable_id' => $branch->brand_id, 'serviceable_type' => ServiceableTypeEnum::Brand, 'category_id' => $category->id],
            [
                'name' => ['en' => $nameEn, 'ar' => $nameAr],
                'price_amount_minor' => $priceMinor,
                'currency_code' => $currency->code,
                'duration_minutes' => $minutes,
                'is_at_home' => false,
                'is_active' => true,
            ],
        );
    }

    private function booking(ChairModel $chair, BarberModel $barber, OfferedServiceModel $service, string $clientEn, string $clientAr, int $hour, BookingStatus $status, int $daysAgo = 0): void
    {
        $client = ClientModel::factory()->create(['name' => ['en' => $clientEn, 'ar' => $clientAr]]);
        $startsAt = now()->subDays($daysAgo)->setTime($hour, 0);

        $booking = BookingModel::factory()->create([
            'client_id' => $client->id,
            'chair_id' => $chair->id,
            'barber_id' => $barber->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes((int) $service->duration_minutes),
            'booking_status' => $status->value,
        ]);
        $booking->services()->attach($service->id);
    }
}
