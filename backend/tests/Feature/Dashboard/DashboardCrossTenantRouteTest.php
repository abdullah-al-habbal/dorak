<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route as RouteFacade;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\NotificationModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

const TENANT_ROUTE_PREFIX = 'api/v1/dashboard/';
const TENANT_ADMIN_PREFIX = 'api/v1/dashboard/admin/';

/** Tables that hold owner B's data; a refused request must leave every row of them untouched. */
const TENANT_TABLES = [
    'brands', 'branches', 'chairs', 'offered_services', 'bookings', 'barbers', 'reviews',
    'barber_affiliations', 'job_postings', 'job_applications', 'branch_hours_overrides', 'barber_service_overrides',
];

/**
 * Owner B's records, one of every kind an ID route can name, all inside B's brand.
 *
 * @return array<string, string> route parameter name to a real ID owned by owner B
 */
function tenantFixtureIds(ClientModel $owner): array
{
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);
    $barberService = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => $barber->id]);
    $brandService = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $brand->id]);
    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $notification = new NotificationModel;
    $notification->forceFill([
        'notifiable_type' => $owner->getMorphClass(),
        'notifiable_id' => $owner->getKey(),
        'type' => NotificationTypeEnum::PlatformEvent,
        'title' => 'Title',
        'body' => 'Body',
        'data' => ['event' => 'review_disputed', 'subject_id' => 'x'],
    ])->save();

    BranchHoursOverrideModel::query()->create(['branch_id' => $branch->id, 'override_date' => Carbon::today()->addDays(3)->toDateString(), 'is_closed' => true]);

    return [
        'brand' => $brand->id,
        'branch' => $branch->id,
        'chair' => ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id])->id,
        'barber' => $barber->id,
        'stylist' => $barber->id,
        'service' => $brandService->id,
        'barberService' => $barberService->id,
        'booking' => BookingModel::factory()->create(['branch_id' => $branch->id])->id,
        'completedBooking' => BookingModel::factory()->completed()->create(['branch_id' => $branch->id])->id,
        'review' => ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Branch, 'subject_id' => $branch->id])->id,
        'affiliation' => BarberAffiliationModel::factory()->pending()->create(['barber_id' => BarberModel::factory()->create()->id, 'affiliable_id' => $branch->id])->id,
        'jobPosting' => $posting->id,
        'application' => ApplicationModel::factory()->create(['job_posting_id' => $posting->id])->id,
        'notification' => (string) $notification->getKey(),
        'date' => Carbon::today()->addDays(3)->toDateString(),
    ];
}

/**
 * Every tenant-facing dashboard route that names a record, read from the router itself so a new one is covered the
 * moment it exists. A parameter without a fixture fails the test instead of being skipped.
 *
 * @param  array<string, string>  $ids
 * @return array<string, array{0: string, 1: string}> method and URL, keyed by "METHOD uri"
 */
function tenantIdRoutes(array $ids): array
{
    $routes = [];
    foreach (RouteFacade::getRoutes()->getRoutes() as $route) {
        /** @var Route $route */
        $uri = $route->uri();
        if (! str_starts_with($uri, TENANT_ROUTE_PREFIX) || str_starts_with($uri, TENANT_ADMIN_PREFIX) || $route->parameterNames() === []) {
            continue;
        }
        // The override routes name a stylist's own service and the rating route needs a finished visit.
        $remap = match (true) {
            str_contains($uri, '/override') => ['service' => 'barberService'],
            str_ends_with($uri, '/review') => ['booking' => 'completedBooking'],
            default => [],
        };
        $url = '/'.preg_replace_callback('/\{([^}]+)\}/', fn (array $match): string => $ids[$remap[$match[1]] ?? $match[1]] ?? "UNMAPPED-{$match[1]}", $uri);
        foreach (array_diff($route->methods(), ['HEAD']) as $method) {
            $routes[$method.' '.$uri] = [$method, $url];
        }
    }

    return $routes;
}

/**
 * A body that passes validation, so the request reaches the tenant check instead of stopping at a 422. The attacker
 * names its own brand wherever a brand is asked for.
 *
 * @param  array<string, string>  $ids
 * @return array<string, mixed>
 */
function tenantPayload(string $key, array $ids, string $ownBrandId): array
{
    $timestamp = Carbon::now('UTC')->addDays(5)->setTime(10, 0);
    $translated = ['en' => 'Text', 'ar' => 'نص'];

    return match ($key) {
        'PATCH api/v1/dashboard/bookings/{booking}' => ['booking_status' => 'in_progress'],
        'PATCH api/v1/dashboard/bookings/{booking}/reschedule' => ['starts_at' => $timestamp->format('Y-m-d\TH:i:s\Z'), 'ends_at' => $timestamp->copy()->addHour()->format('Y-m-d\TH:i:s\Z')],
        'POST api/v1/dashboard/bookings/{booking}/review' => ['rating' => 5],
        'PUT api/v1/dashboard/branches/{branch}' => ['brand_id' => $ownBrandId, 'name' => $translated, 'email' => 'attacker-branch@example.test'],
        'PUT api/v1/dashboard/branches/{branch}/opening-hours' => ['hours' => [['day_of_week' => 1, 'opens_time' => '09:00', 'closes_time' => '17:00']]],
        'PUT api/v1/dashboard/branches/{branch}/hours-overrides/{date}' => ['is_closed' => true],
        'PUT api/v1/dashboard/branches/{branch}/hours-overrides' => ['date_from' => $timestamp->toDateString(), 'date_to' => $timestamp->toDateString(), 'is_closed' => true],
        'PATCH api/v1/dashboard/branches/{branch}/floor-plan' => ['preset' => 'standard'],
        'POST api/v1/dashboard/branches/{branch}/reviews/{review}/dispute' => ['reason' => 'This review is unfair and wrong.'],
        'POST api/v1/dashboard/branches/{branch}/affiliations' => ['barber_id' => $ids['barber']],
        'POST api/v1/dashboard/branches/{branch}/affiliations/by-contact' => ['contact' => 'nobody@example.test'],
        'POST api/v1/dashboard/branches/{branch}/job-postings' => ['title' => $translated, 'description' => $translated],
        'PATCH api/v1/dashboard/branches/{branch}/job-postings/{jobPosting}/applications/{application}/status' => ['status' => 'accepted'],
        'PUT api/v1/dashboard/barbers/{barber}/services/{service}/override' => ['brand_id' => $ownBrandId, 'price_amount_minor' => 1000],
        'GET api/v1/dashboard/barbers/{barber}/services', 'DELETE api/v1/dashboard/barbers/{barber}/services/{service}/override' => ['brand_id' => $ownBrandId],
        'PUT api/v1/dashboard/services/{service}' => ['serviceable_id' => $ids['brand'], 'serviceable_type' => 'brand', 'currency_code' => CurrencyModel::factory()->create()->code, 'name' => $translated, 'price_amount_minor' => 1000, 'duration_minutes' => 30],
        'PUT api/v1/dashboard/chairs/{chair}' => ['branch_id' => $ids['branch'], 'label' => 'Chair', 'floor_zone' => 'shared', 'status' => 'available', 'layout_settings' => ['position_x' => 10, 'position_y' => 10, 'width' => 50, 'height' => 50]],
        'PUT api/v1/dashboard/stylists/{stylist}' => ['name' => $translated, 'email' => 'attacker-stylist@example.test'],
        default => [],
    };
}

/** @return array{0: int, 1: int, 2: int} sort key: destructive routes last, deeper paths first */
function tenantRunOrder(string $key): array
{
    $destructive = str_starts_with($key, 'DELETE') || str_ends_with($key, '/cancel');

    return [(int) $destructive, (int) str_contains($key, '/chairs/'), -substr_count($key, '/')];
}

/** @return array<string, string> table to a digest of every row, soft-deleted included */
function tenantTableDigests(): array
{
    return collect(TENANT_TABLES)->mapWithKeys(fn (string $table): array => [$table => md5(DB::table($table)->orderBy('id')->get()->toJson())])->all();
}

describe('An owner can reach no ID route of another owner\'s brand', function (): void {
    beforeEach(function (): void {
        $this->ownerB = ClientModel::factory()->create();
        $this->ids = tenantFixtureIds($this->ownerB);
        $this->ownBrandB = $this->ids['brand'];

        $this->ownerA = ClientModel::factory()->create();
        $this->brandA = $brandA = BrandModel::factory()->create(['owner_id' => $this->ownerA->id]);
        $this->managerA = BranchModel::factory()->create(['brand_id' => $brandA->id]);
    });

    it('reads every ID-bearing route and maps every parameter to a fixture', function (): void {
        $routes = tenantIdRoutes($this->ids);

        expect(count($routes))->toBeGreaterThanOrEqual(50)
            ->and(collect($routes)->pluck(1)->filter(fn (string $url): bool => str_contains($url, 'UNMAPPED-'))->all())->toBe([]);
    });

    it('answers 403 or 404 to owner A and to a manager of owner A, and changes nothing', function (): void {
        $before = tenantTableDigests();
        $wrong = [];

        foreach ([$this->ownerA, $this->managerA] as $actor) {
            $this->authenticateDashboardActor($actor);
            foreach (tenantIdRoutes($this->ids) as $key => [$method, $url]) {
                $status = $this->json($method, $url, tenantPayload($key, $this->ids, $this->brandA->id))->getStatusCode();
                if (! in_array($status, [403, 404], true)) {
                    $wrong[] = "{$key} answered {$status} to ".class_basename($actor);
                }
            }
            app('auth')->forgetGuards();
            $this->flushHeaders();
        }

        expect($wrong)->toBe([])
            ->and(tenantTableDigests())->toBe($before);
    });

    it('proves the control: the owner of the records gets through on every route with the same body', function (): void {
        $routes = tenantIdRoutes($this->ids);
        // Cancelling and deleting run last (a chair before a stylist's own delete would orphan them), deepest first, so
        // an earlier change never turns a later answer into a 404 or a 422.
        uksort($routes, fn (string $a, string $b): int => tenantRunOrder($a) <=> tenantRunOrder($b));

        $this->authenticateDashboardActor($this->ownerB);
        $blocked = [];
        foreach ($routes as $key => [$method, $url]) {
            $status = $this->json($method, $url, tenantPayload($key, $this->ids, $this->ownBrandB))->getStatusCode();
            if (in_array($status, [401, 403, 404, 422], true) || $status >= 500) {
                $blocked[] = "{$key} answered {$status} to its own owner";
            }
        }

        expect($blocked)->toBe([]);
    });
});
