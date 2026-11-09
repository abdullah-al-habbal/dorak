<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
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
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\Settings\Constants\SettingsConstants;
use Modules\Subscription\Enums\SubscriptionIntervalUnitEnum;
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

    /** The enabled stylist who signs in to the barber portal (schedule spec). */
    public const string BARBER_EMAIL = 'omar.e2e@dorak.test';

    public const string BARBER_PASSWORD = 'e2e-password-123';

    /** Display orders that identify the two seeded plans: the active one the brand is on and an inactive one the plans spec edits. */
    public const int GROWTH_PLAN_ORDER = 99;

    public const int LEGACY_PLAN_ORDER = 100;

    /** The pending brand the admin brands spec approves; every reset puts it back to `pending`. */
    public const string PENDING_BRAND_OWNER_EMAIL = 'e2e-pending-owner@dorak.test';

    public const array PENDING_BRAND_NAME = ['en' => 'E2E Pending Cuts', 'ar' => 'قصات قيد المراجعة'];

    /** Older than every other brand, so lists ordered newest first keep their order and show it last. */
    public const string PENDING_BRAND_CREATED_AT = '2020-01-01 00:00:00';

    /** The empty category the admin catalog spec toggles and deletes; every reset restores it. */
    public const string CATALOG_EMPTY_CATEGORY_SLUG = 'e2e-catalog-empty';

    public const array CATALOG_EMPTY_CATEGORY_NAME = ['en' => 'E2E Empty Category', 'ar' => 'فئة فارغة للاختبار'];

    /** Categories the admin catalog spec creates start with this English name; every reset removes them. */
    public const string CATALOG_SPEC_NAME_PREFIX = 'E2E Spec';

    /** The seeded chairs; the chairs spec creates others, and every reset removes them. */
    private const array CHAIR_LABELS = ['Chair 1', 'Chair 2'];

    public function run(): void
    {
        // One transaction: a reseed that fails part-way keeps the previous baseline instead of a half-reset database.
        DB::transaction(fn () => $this->seedBaseline());
        // After the commit, so no request can re-cache the old settings in between.
        Cache::forget(SettingsConstants::SETTINGS_CACHE_KEY);
    }

    private function seedBaseline(): void
    {
        $currency = CurrencyModel::query()->firstOrCreate(
            ['code' => 'USD'],
            ['name' => ['en' => 'US dollar', 'ar' => 'دولار أمريكي'], 'symbol' => '$', 'is_default' => true],
        );

        $owner = $this->owner();
        $branch = $this->branch($currency, $owner);
        $this->restoreBranchBaseline($branch);
        $chairs = array_map(fn (string $label): ChairModel => $this->chair($branch, $label), self::CHAIR_LABELS);
        ChairModel::query()->where('branch_id', $branch->id)->whereNotIn('label', self::CHAIR_LABELS)->delete();

        DB::table('branch_opening_hours')->where('branch_id', $branch->id)->delete();

        $omar = $this->stylist(self::BARBER_EMAIL, 'Omar Haddad', 'عمر حداد', BarberStatusEnum::Enabled, $chairs[0]);
        $this->barberHours($omar);
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
        $this->ownerBilling($branch->brand, $owner, $currency);
        $this->pendingBrand($currency);
        $this->restoreSettingsBaseline();
        $this->restoreCatalogBaseline();
    }

    /** Admin catalog spec: restore the empty category and drop the ones the spec created (they never get items or services). */
    private function restoreCatalogBaseline(): void
    {
        $this->catalogCategory(self::CATALOG_EMPTY_CATEGORY_SLUG, self::CATALOG_EMPTY_CATEGORY_NAME);
        ServiceCatalogCategoryModel::withTrashed()
            ->where('name->en', 'like', self::CATALOG_SPEC_NAME_PREFIX.'%')
            ->each(fn (ServiceCatalogCategoryModel $category) => $category->forceDelete());
    }

    /**
     * Slugs stay unique across soft-deleted rows, so a category a spec deleted is restored, not
     * re-inserted; a spec that switched it off gets it back active and top-level.
     *
     * @param  array{en: string, ar: string}  $name
     */
    private function catalogCategory(string $slug, array $name): ServiceCatalogCategoryModel
    {
        $category = ServiceCatalogCategoryModel::withTrashed()->updateOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true, 'parent_id' => null],
        );
        if ($category->trashed()) {
            $category->restore();
        }

        return $category;
    }

    /** Admin specs edit platform settings; every reset puts them back on their defaults (`run()` clears the cache). */
    private function restoreSettingsBaseline(): void
    {
        DB::table('platform_settings')->delete();
    }

    /** One shift per weekday (unique key): Mon to Wed work, Thu is switched off, the rest are days off. Weekdays: 0 is Sunday. */
    private function barberHours(BarberModel $barber): void
    {
        BarberScheduleModel::query()->where('barber_id', $barber->id)->delete();
        $rows = [[1, '09:00', '13:00', true], [2, '10:00', '16:00', true], [3, '09:00', '17:00', true], [4, '09:00', '17:00', false]];
        foreach ($rows as [$day, $start, $end, $active]) {
            BarberScheduleModel::factory()->create(['barber_id' => $barber->id, 'day_of_week' => $day, 'start_time' => $start, 'end_time' => $end, 'is_active' => $active]);
        }
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
        // Reuse the seeded completed bookings and their clients: the factory's own booking would create random
        // currencies, and its own author a random-e-mail client per reseed that collides once enough have piled up.
        $bookings = BookingModel::query()->where('branch_id', $branch->id)->where('booking_status', BookingStatus::Completed)->orderBy('id')->get(['id', 'client_id']);
        foreach ($rows as $index => [$rating, $body, $status]) {
            ReviewModel::factory()->create([
                'booking_id' => $bookings[$index]->id,
                'author_id' => $bookings[$index]->client_id,
                'author_type' => ReviewAuthorTypeEnum::Client,
                'subject_type' => ReviewSubjectTypeEnum::Branch,
                'subject_id' => $branch->id,
                'rating' => $rating,
                'body' => $body,
                'status' => $status,
            ]);
        }
    }

    /** A second owner's brand awaiting approval (admin brands spec). Seeded owner and currency, no factory relations. */
    private function pendingBrand(CurrencyModel $currency): void
    {
        $owner = ClientModel::query()->firstOrCreate(
            ['email' => self::PENDING_BRAND_OWNER_EMAIL],
            ClientModel::factory()->raw(['email' => self::PENDING_BRAND_OWNER_EMAIL, 'name' => ['en' => 'E2E Pending Owner', 'ar' => 'مالك قيد المراجعة'], 'password' => Hash::make(self::OWNER_PASSWORD)]),
        );
        $brand = BrandModel::query()->updateOrCreate(
            ['owner_id' => $owner->id],
            ['name' => self::PENDING_BRAND_NAME, 'status' => BrandStatusEnum::Pending->value, 'base_currency_code' => $currency->code],
        );
        $brand->forceFill(['created_at' => self::PENDING_BRAND_CREATED_AT])->saveQuietly();
    }

    /** The brand owner (dashboard actor `owner`). */
    private function owner(): ClientModel
    {
        return ClientModel::query()->firstOrCreate(
            ['email' => self::OWNER_EMAIL],
            ClientModel::factory()->raw(['email' => self::OWNER_EMAIL, 'name' => ['en' => 'E2E Owner', 'ar' => 'مالك الاختبار'], 'password' => Hash::make(self::OWNER_PASSWORD)]),
        );
    }

    /** The owner's brand with an active plan and payouts in every visible status plus one hidden draft. */
    private function ownerBilling(BrandModel $brand, ClientModel $owner, CurrencyModel $currency): void
    {
        $brand->update(['owner_id' => $owner->id]);

        BrandSubscriptionModel::query()->where('brand_id', $brand->id)->delete();
        $this->removeOtherBrandSubscriptions($brand);
        $plan = $this->plan($currency, self::GROWTH_PLAN_ORDER, 4900, ['en' => 'E2E Growth', 'ar' => 'نمو الاختبار'], true);
        $this->plan($currency, self::LEGACY_PLAN_ORDER, 2900, ['en' => 'E2E Legacy', 'ar' => 'الخطة القديمة'], false);
        // The plans spec creates and edits plans; anything that is not one of the two seeded plans goes.
        SubscriptionPlanModel::query()->whereNotIn('sort_order', [self::GROWTH_PLAN_ORDER, self::LEGACY_PLAN_ORDER])->forceDelete();
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

    /** The subscriptions spec assigns a plan to another brand; that subscription and the feature flags it granted go, so the seeded one is the only subscription. */
    private function removeOtherBrandSubscriptions(BrandModel $brand): void
    {
        $syncer = app(PlanFeatureSyncer::class);
        BrandSubscriptionModel::query()->whereNot('brand_id', $brand->id)->with('brand')->get()
            ->each(function (BrandSubscriptionModel $subscription) use ($syncer): void {
                if ($subscription->brand !== null) {
                    $syncer->revoke($subscription->brand);
                }
                $subscription->delete();
            });
    }

    /** A seeded plan keyed by its display order; running the seeder again restores its name, price and active flag. */
    private function plan(CurrencyModel $currency, int $order, int $price, array $name, bool $active): SubscriptionPlanModel
    {
        $plan = SubscriptionPlanModel::query()->withTrashed()->firstOrNew(['sort_order' => $order, 'currency_code' => $currency->code]);
        $plan->fill([
            'name' => $name,
            'description' => ['en' => 'For growing brands.', 'ar' => 'للعلامات النامية.'],
            'price_amount_minor' => $price,
            'interval_unit' => SubscriptionIntervalUnitEnum::Month,
            'interval_count' => 1,
            'is_active' => $active,
        ]);
        $plan->save();
        $plan->restore();

        return $plan;
    }

    private function branch(CurrencyModel $currency, ClientModel $owner): BranchModel
    {
        $existing = BranchModel::query()->where('email', self::MANAGER_EMAIL)->first();
        if ($existing !== null) {
            return $existing;
        }

        // Seeded owner and currency: the factory's own are a random-e-mail client and a random currency code,
        // which collide with rows the base seeders (or this one) already created.
        $brand = BrandModel::factory()->create(['status' => BrandStatusEnum::Active->value, 'owner_id' => $owner->id, 'base_currency_code' => $currency->code]);

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
            BarberModel::factory()->raw(['email' => $email, 'name' => ['en' => $en, 'ar' => $ar], 'status' => $status->value, 'password' => Hash::make(self::BARBER_PASSWORD)]),
        );
        // The stylists spec toggles the status; restore it so a failed run cannot leak into the next project.
        $barber->update(['name' => ['en' => $en, 'ar' => $ar], 'status' => $status->value]);
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
        $category = $this->catalogCategory('e2e-'.strtolower($categoryEn), ['en' => $categoryEn, 'ar' => $categoryAr]);

        // updateOrCreate: the services spec toggles the active flag, and a reset must restore it.
        return OfferedServiceModel::query()->updateOrCreate(
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
        // A fixed e-mail per client name: random factory e-mails collide once many reseeds have piled up.
        $email = 'e2e-client-'.Str::slug($clientEn).'@dorak.test';
        $client = ClientModel::query()->firstOrCreate(
            ['email' => $email],
            ClientModel::factory()->raw(['email' => $email, 'name' => ['en' => $clientEn, 'ar' => $clientAr]]),
        );
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
