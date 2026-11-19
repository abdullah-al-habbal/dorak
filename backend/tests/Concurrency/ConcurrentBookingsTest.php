<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingIdempotencyKeyModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

require_once dirname(__DIR__).'/Support/concurrency-helpers.php';

/**
 * Parallel booking requests (BG-9). Every request is its own PHP process with its own database session, started
 * together, against rows that are committed first. Each test checks the outcome the locks must guarantee: at most one
 * blocking booking per barber or chair and time, and no request ending in a database error (HTTP 500).
 *
 * The locks that serialize these requests are the client, chair, service and barber row locks taken by
 * CreateBookingEloquentResolver. There is no unique constraint behind them (MySQL cannot express a time-range
 * exclusion), so these tests are the only proof that they hold.
 */
afterEach(function (): void {
    while (DB::transactionLevel() > 0) {
        DB::commit();
    }
    DB::purge('concurrency_locker');
    Artisan::call('migrate:fresh', ['--force' => true]);
});

const BOOKING_RACE_SESSION_SECRET = 'dashboard-session-secret-that-is-at-least-thirty-two-characters';

/** @return array{branch: BranchModel, barber: BarberModel, service: OfferedServiceModel, slot: Carbon} */
function bookingRaceWorld(): array
{
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create();
    BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $branch->id]);
    $service = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'serviceable_id' => $branch->brand_id,
        'duration_minutes' => 30,
    ]);

    return ['branch' => $branch, 'barber' => $barber, 'service' => $service, 'slot' => Carbon::tomorrow()->startOfDay()->addHours(10)];
}

function bookingRaceClientToken(): string
{
    return ClientModel::factory()->create()->createToken('concurrency', [TokenAbility::ClientActive->value])->plainTextToken;
}

/** @return list<int> */
/** @return array<string, string> A fresh `Idempotency-Key`: `POST /bookings` requires one and these races are not about replays. */
function bookingRaceFreshKey(): array
{
    return [BookingConstants::BOOKING_IDEMPOTENCY_HEADER => (string) Str::uuid()];
}

function bookingRaceBlockingCount(string $column, string $id): int
{
    return BookingModel::query()->where($column, $id)->whereIn('booking_status', BookingStatus::reservationBlockingValues())->count();
}

describe('Parallel bookings', function (): void {
    it('lets one of five clients win the same barber and slot and refuses the rest with 409', function (): void {
        $world = bookingRaceWorld();
        $tokens = array_map(fn () => bookingRaceClientToken(), range(1, 5));
        concurrencyCommitFixtures();

        $workers = array_map(fn (string $token) => concurrencyStart('POST', '/api/v1/bookings', $token, [
            'barber_id' => $world['barber']->id,
            'branch_id' => $world['branch']->id,
            'starts_at' => $world['slot']->toIso8601ZuluString(),
            'service_ids' => [$world['service']->id],
        ], bookingRaceFreshKey()), $tokens);
        $results = array_map('concurrencyFinish', $workers);

        expect(concurrencyStatuses($results))->toBe([201, 409, 409, 409, 409])
            ->and(bookingRaceBlockingCount('barber_id', $world['barber']->id))->toBe(1);
    });

    it('turns five simultaneous retries of one keyed request into one booking and four replays', function (): void {
        $world = bookingRaceWorld();
        $token = bookingRaceClientToken();
        concurrencyCommitFixtures();

        $workers = array_map(fn () => concurrencyStart('POST', '/api/v1/bookings', $token, [
            'barber_id' => $world['barber']->id,
            'branch_id' => $world['branch']->id,
            'starts_at' => $world['slot']->toIso8601ZuluString(),
            'service_ids' => [$world['service']->id],
        ], ['Idempotency-Key' => 'parallel-retry-0001']), range(1, 5));
        $results = array_map('concurrencyFinish', $workers);

        expect(concurrencyStatuses($results))->toBe([201, 201, 201, 201, 201])
            ->and(count(array_unique(array_map(fn (array $result): mixed => $result['body']['data']['id'] ?? null, $results))))->toBe(1)
            ->and(bookingRaceBlockingCount('barber_id', $world['barber']->id))->toBe(1)
            ->and(BookingIdempotencyKeyModel::query()->count())->toBe(1);
    });

    it('lets one of a chair booking and a barber booking win when both need the same barber and slot', function (): void {
        $world = bookingRaceWorld();
        $chair = ChairModel::factory()->create(['branch_id' => $world['branch']->id, 'barber_id' => $world['barber']->id]);
        $tokens = [bookingRaceClientToken(), bookingRaceClientToken()];
        concurrencyCommitFixtures();

        $common = ['starts_at' => $world['slot']->toIso8601ZuluString(), 'service_ids' => [$world['service']->id]];
        $workers = [
            concurrencyStart('POST', '/api/v1/bookings', $tokens[0], ['chair_id' => $chair->id, ...$common], bookingRaceFreshKey()),
            concurrencyStart('POST', '/api/v1/bookings', $tokens[1], ['barber_id' => $world['barber']->id, 'branch_id' => $world['branch']->id, ...$common], bookingRaceFreshKey()),
        ];
        $results = array_map('concurrencyFinish', $workers);

        expect(concurrencyStatuses($results))->toBe([201, 409])
            ->and(bookingRaceBlockingCount('barber_id', $world['barber']->id))->toBe(1);
    });

    it('never ends in a database error when a dashboard reschedule races a client booking on the same chair', function (): void {
        // A reschedule locks the booking row, then the chair; a create locks the chair, then scans (and locks) the
        // overlapping booking rows. Run the pair repeatedly: a deadlock between them would surface as HTTP 500.
        $rounds = (int) (getenv('BOOKING_RACE_ROUNDS') ?: 8);
        $statuses = [];

        for ($round = 0; $round < $rounds; $round++) {
            $world = bookingRaceWorld();
            $chair = ChairModel::factory()->create(['branch_id' => $world['branch']->id, 'barber_id' => $world['barber']->id]);
            $existing = BookingModel::factory()->create([
                'chair_id' => $chair->id,
                'barber_id' => $world['barber']->id,
                'branch_id' => $world['branch']->id,
                'booking_status' => BookingStatus::Confirmed->value,
                'starts_at' => $world['slot'],
                'ends_at' => $world['slot']->copy()->addMinutes(30),
            ]);
            $clientToken = bookingRaceClientToken();
            config(['dashboard.dashboard.session_secret' => BOOKING_RACE_SESSION_SECRET]);
            $actor = new DashboardActor((string) $world['branch']->getKey(), DashboardActorTypeEnum::Branch, 'branch_manager', (string) $world['branch']->getKey(), (string) $world['branch']->brand_id);
            $access = $world['branch']->createToken('dashboard-session', ['dashboard']);
            $claim = app(DashboardSessionClaim::class)->issue($actor, $access->accessToken->getKey());
            concurrencyCommitFixtures();

            $moved = $world['slot']->copy()->addHours(3);
            $workers = [
                'reschedule' => concurrencyStart('PATCH', "/api/v1/dashboard/bookings/{$existing->id}/reschedule", $access->plainTextToken, [
                    'starts_at' => $moved->toIso8601ZuluString(),
                    'ends_at' => $moved->copy()->addMinutes(30)->toIso8601ZuluString(),
                ], ['X-Dashboard-Session' => $claim], ['DASHBOARD_SESSION_SECRET' => BOOKING_RACE_SESSION_SECRET, 'APP_DEBUG' => 'true']),
                'create' => concurrencyStart('POST', '/api/v1/bookings', $clientToken, [
                    'chair_id' => $chair->id,
                    'starts_at' => $world['slot']->toIso8601ZuluString(),
                    'service_ids' => [$world['service']->id],
                ], bookingRaceFreshKey(), ['APP_DEBUG' => 'true']),
            ];
            $results = array_map('concurrencyFinish', $workers);
            $statuses[] = [$results['reschedule']['status'], $results['create']['status']];

            expect($results['reschedule']['status'])->toBeIn([200, 409], 'round '.$round.' reschedule: '.$results['reschedule']['stderr'])
                ->and($results['create']['status'])->toBeIn([201, 409], 'round '.$round.' create: '.$results['create']['stderr'])
                ->and(bookingRaceBlockingCount('chair_id', $chair->id))->toBeLessThanOrEqual(2);

            // The rule that matters: no two blocking bookings overlap on the chair, whichever request won.
            $blocking = BookingModel::query()->where('chair_id', $chair->id)->whereIn('booking_status', BookingStatus::reservationBlockingValues())->orderBy('starts_at')->get();
            foreach ($blocking->slice(1) as $index => $booking) {
                expect($blocking[$index - 1]->ends_at->lte($booking->starts_at))->toBeTrue('round '.$round.': overlapping blocking bookings on one chair');
            }

            concurrencyCommitFixtures();
        }

        expect($statuses)->toHaveCount($rounds);
    });
});
