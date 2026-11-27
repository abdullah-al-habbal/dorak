<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchHoursSource;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchOpeningHourModel;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

function storefrontWeek(string $opens = '09:00', string $closes = '21:00'): array
{
    return array_map(fn (int $weekday): array => [
        'day_of_week' => $weekday,
        'is_closed' => $weekday === 5,
        'opens_time' => $weekday === 5 ? null : $opens,
        'closes_time' => $weekday === 5 ? null : $closes,
    ], range(0, 6));
}

describe('storefront schema', function (): void {
    it('adds the storefront columns and hours tables', function (): void {
        expect(Schema::hasColumns('branches', ['description', 'address', 'tags']))->toBeTrue()
            ->and(Schema::hasColumns('branch_opening_hours', ['branch_id', 'day_of_week', 'opens_time', 'closes_time', 'is_closed']))->toBeTrue()
            ->and(Schema::hasColumns('branch_hours_overrides', ['branch_id', 'override_date', 'opens_time', 'closes_time', 'is_closed']))->toBeTrue();
    });
});

describe('PATCH /api/v1/branch/profile', function (): void {
    it('persists the translatable description and address in both locales', function (): void {
        $branch = BranchModel::factory()->create();

        $this->actingAs($branch, 'branch_api')
            ->patchJson('/api/v1/branch/profile', [
                'description' => ['en' => 'Classic cuts since 1990', 'ar' => 'قصات كلاسيكية منذ 1990'],
                'address' => ['en' => '12 Baghdad St, Damascus', 'ar' => '12 شارع بغداد، دمشق'],
                'tags' => [['en' => 'beard', 'ar' => 'لحية'], ['en' => 'kids', 'ar' => 'أطفال']],
            ])
            ->assertOk()
            ->assertJsonPath('data.description', 'Classic cuts since 1990')
            ->assertJsonPath('data.translations.address.ar', '12 شارع بغداد، دمشق')
            ->assertJsonPath('data.tags', ['beard', 'kids'])
            ->assertJsonPath('data.translations.tags.0.ar', 'لحية');

        $fresh = $branch->fresh();
        expect($fresh->getTranslation('description', 'ar'))->toBe('قصات كلاسيكية منذ 1990')
            ->and($fresh->getTranslation('address', 'en'))->toBe('12 Baghdad St, Damascus');
    });

    it('returns the hours on GET branch/profile', function (): void {
        $branch = BranchModel::factory()->create();
        BranchOpeningHourModel::query()->create(['branch_id' => $branch->id, 'day_of_week' => now()->dayOfWeek, 'opens_time' => '10:00', 'closes_time' => '18:00']);

        $this->actingAs($branch, 'branch_api')
            ->getJson('/api/v1/branch/profile')
            ->assertOk()
            ->assertJsonPath('data.opening_hours.0.opens_time', '10:00')
            ->assertJsonPath('data.today_hours.closes_time', '18:00')
            ->assertJsonPath('data.today_hours.source', BranchHoursSource::Weekly->value);
    });
});

describe('PUT /api/v1/branch/opening-hours', function (): void {
    it('stores a full week', function (): void {
        $branch = BranchModel::factory()->create();

        $this->actingAs($branch, 'branch_api')
            ->putJson('/api/v1/branch/opening-hours', ['hours' => storefrontWeek()])
            ->assertOk()
            ->assertJsonCount(7, 'data.opening_hours')
            ->assertJsonPath('data.opening_hours.5.is_closed', true)
            ->assertJsonPath('data.opening_hours.5.opens_time', null);

        expect(BranchOpeningHourModel::query()->where('branch_id', $branch->id)->count())->toBe(7);
    });

    it('replaces existing days instead of duplicating them', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api')->putJson('/api/v1/branch/opening-hours', ['hours' => storefrontWeek()])->assertOk();
        $this->actingAs($branch, 'branch_api')->putJson('/api/v1/branch/opening-hours', ['hours' => storefrontWeek('08:00', '20:00')])->assertOk();

        expect(BranchOpeningHourModel::query()->where('branch_id', $branch->id)->count())->toBe(7)
            ->and(BranchOpeningHourModel::query()->where('branch_id', $branch->id)->where('day_of_week', 0)->value('opens_time'))->toStartWith('08:00');
    });

    it('rejects closing at or before opening with 422', function (string $closes): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->putJson('/api/v1/branch/opening-hours', ['hours' => [['day_of_week' => 1, 'opens_time' => '10:00', 'closes_time' => $closes]]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['hours.0.closes_time']);
    })->with(['equal' => ['10:00'], 'before' => ['09:00']]);

    it('rejects duplicate weekdays and missing times on open days', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->putJson('/api/v1/branch/opening-hours', ['hours' => [
                ['day_of_week' => 1, 'opens_time' => '10:00', 'closes_time' => '18:00'],
                ['day_of_week' => 1, 'opens_time' => '10:00'],
            ]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['hours.0.day_of_week', 'hours.1.closes_time']);
    });

    it('requires the branch guard', function (): void {
        $this->putJson('/api/v1/branch/opening-hours', ['hours' => storefrontWeek()])->assertUnauthorized();
    });
});

describe('PUT /api/v1/branch/hours-overrides/{date}', function (): void {
    it('returns a same-day override as today_hours in explore', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api')->putJson('/api/v1/branch/opening-hours', ['hours' => storefrontWeek()])->assertOk();

        $this->actingAs($branch, 'branch_api')
            ->putJson('/api/v1/branch/hours-overrides/'.now()->toDateString(), ['opens_time' => '12:00', 'closes_time' => '16:00'])
            ->assertOk()
            ->assertJsonPath('data.today_hours.source', BranchHoursSource::Override->value);

        $this->getJson("/api/v1/explore/branches/{$branch->id}")
            ->assertOk()
            ->assertJsonPath('data.today_hours.date', now()->toDateString())
            ->assertJsonPath('data.today_hours.opens_time', '12:00')
            ->assertJsonPath('data.today_hours.closes_time', '16:00')
            ->assertJsonPath('data.today_hours.source', BranchHoursSource::Override->value)
            ->assertJsonCount(7, 'data.opening_hours');
    });

    it('can close the branch for a day and clear the override again', function (): void {
        $branch = BranchModel::factory()->create();
        $date = now()->addDay()->toDateString();

        $this->actingAs($branch, 'branch_api')->putJson("/api/v1/branch/hours-overrides/{$date}", ['is_closed' => true])->assertOk();
        expect(BranchHoursOverrideModel::query()->where('branch_id', $branch->id)->sole()->is_closed)->toBeTrue();

        $this->actingAs($branch, 'branch_api')->deleteJson("/api/v1/branch/hours-overrides/{$date}")->assertOk();
        expect(BranchHoursOverrideModel::query()->count())->toBe(0);
    });

    it('rejects an invalid date or inverted hours', function (): void {
        $branch = BranchModel::factory()->create();

        $this->actingAs($branch, 'branch_api')->putJson('/api/v1/branch/hours-overrides/2026-13-40', ['opens_time' => '10:00', 'closes_time' => '12:00'])
            ->assertUnprocessable()->assertJsonValidationErrors(['date']);
        $this->actingAs($branch, 'branch_api')->putJson('/api/v1/branch/hours-overrides/2026-12-01', ['opens_time' => '12:00', 'closes_time' => '10:00'])
            ->assertUnprocessable()->assertJsonValidationErrors(['closes_time']);
    });
});

describe('dashboard branch storefront', function (): void {
    it('lets a manager save storefront fields and hours for their branch', function (): void {
        $branch = BranchModel::factory()->create();

        $this->authenticateDashboardActor($branch)
            ->putJson("/api/v1/dashboard/branches/{$branch->id}", [
                'brand_id' => $branch->brand_id,
                'name' => ['en' => 'Main', 'ar' => 'الرئيسي'],
                'email' => $branch->email,
                'description' => ['en' => 'Downtown', 'ar' => 'وسط البلد'],
                'address' => ['en' => 'Main St', 'ar' => 'الشارع الرئيسي'],
                'opening_hours' => storefrontWeek(),
            ])
            ->assertOk()
            ->assertJsonPath('data.description.ar', 'وسط البلد')
            ->assertJsonCount(7, 'data.opening_hours');

        $this->authenticateDashboardActor($branch)
            ->getJson("/api/v1/dashboard/branches/{$branch->id}")
            ->assertOk()
            ->assertJsonPath('data.address.en', 'Main St')
            ->assertJsonCount(7, 'data.opening_hours');
    });

    it('forbids a manager from editing another branch\'s hours', function (): void {
        $own = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();

        $this->authenticateDashboardActor($own)
            ->putJson("/api/v1/dashboard/branches/{$other->id}", [
                'brand_id' => $other->brand_id,
                'name' => ['en' => 'Taken', 'ar' => 'مأخوذ'],
                'email' => $other->email,
                'opening_hours' => storefrontWeek(),
            ])
            ->assertForbidden();

        expect(BranchOpeningHourModel::query()->where('branch_id', $other->id)->exists())->toBeFalse();
    });

    it('validates dashboard hours the same way', function (): void {
        $branch = BranchModel::factory()->create();

        $this->authenticateDashboardActor($branch)
            ->putJson("/api/v1/dashboard/branches/{$branch->id}", [
                'brand_id' => $branch->brand_id,
                'name' => ['en' => 'Main', 'ar' => 'الرئيسي'],
                'email' => $branch->email,
                'opening_hours' => [['day_of_week' => 2, 'opens_time' => '18:00', 'closes_time' => '09:00']],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['opening_hours.0.closes_time']);
    });
});

describe('booking against branch hours', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        // These cases state hours on the UTC clock; BranchTimeZoneTest covers other zones.
        app(BranchTimeZones::class)->set($this->branch->id, 'UTC');
        $this->barber = BarberModel::factory()->create();
        $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);
        $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
        $this->slot = Carbon::tomorrow()->startOfDay();
        BranchOpeningHourModel::query()->create(['branch_id' => $this->branch->id, 'day_of_week' => $this->slot->dayOfWeek, 'opens_time' => '09:00', 'closes_time' => '17:00']);
        $this->bookAt = fn (Carbon $startsAt) => $this->actingAs(ClientModel::factory()->create(), 'client')->postJson('/api/v1/bookings', [
            'chair_id' => $this->chair->id,
            'starts_at' => $startsAt->toIso8601String(),
            'service_ids' => [$this->service->id],
        ]);
    });

    it('accepts a chair booking inside the opening hours', function (): void {
        ($this->bookAt)($this->slot->copy()->addHours(16)->addMinutes(30))->assertCreated();
    });

    it('rejects a chair booking outside the opening hours', function (int $hour): void {
        ($this->bookAt)($this->slot->copy()->addHours($hour))
            ->assertUnprocessable()
            ->assertJsonPath('code', 'booking_outside_schedule');
    })->with(['before opening' => [8], 'running past closing' => [17]]);

    it('rejects a booking on a day closed by an override', function (): void {
        BranchHoursOverrideModel::query()->create(['branch_id' => $this->branch->id, 'override_date' => $this->slot->toDateString(), 'is_closed' => true]);

        ($this->bookAt)($this->slot->copy()->addHours(10))->assertUnprocessable();
    });

    it('only offers slots inside the opening hours', function (): void {
        $slots = $this->actingAs(ClientModel::factory()->create(), 'client')->getJson('/api/v1/branches/'.$this->branch->id.'/slots?'.http_build_query([
            'date' => $this->slot->toDateString(),
            'service_ids' => [$this->service->id],
            'chair_id' => $this->chair->id,
        ]))->assertOk()->json('data');

        expect($slots)->not->toBeEmpty()
            ->and(collect($slots)->pluck('starts_at')->map(fn (string $at): string => Carbon::parse($at)->utc()->format('H:i'))->all())
            ->each->toBeGreaterThanOrEqual('09:00')
            ->and(Carbon::parse(collect($slots)->last()['ends_at'])->utc()->format('H:i'))->toBe('17:00');
    });

    it('keeps a branch without configured hours bookable', function (): void {
        BranchOpeningHourModel::query()->delete();

        ($this->bookAt)($this->slot->copy()->addHours(3))->assertCreated();
    });
});
