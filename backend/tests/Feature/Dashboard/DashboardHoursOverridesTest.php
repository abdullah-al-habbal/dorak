<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

function overrideUrl(BranchModel $branch, ?string $date = null): string
{
    return "/api/v1/dashboard/branches/{$branch->id}/hours-overrides".($date === null ? '' : "/{$date}");
}

function futureDate(int $days = 3): string
{
    return Carbon::today()->addDays($days)->toDateString();
}

/** @return list<string> */
function bookableStarts(BranchModel $branch, ChairModel $chair, OfferedServiceModel $service, string $date): array
{
    $query = http_build_query(['date' => $date, 'service_ids' => [$service->id], 'chair_id' => $chair->id]);

    return collect(test()->getJson("/api/v1/branches/{$branch->id}/slots?{$query}")->assertOk()->json('data'))->pluck('starts_at')->all();
}

/** NS-12: closure days and special hours set from the dashboard. */
describe('Set and clear a special day (NS-12)', function (): void {
    it('closes a day, lists it and clears it', function (): void {
        $branch = BranchModel::factory()->create();
        $date = futureDate();
        $this->authenticateDashboardActor($branch);

        $this->putJson(overrideUrl($branch, $date), ['is_closed' => true])
            ->assertOk()
            ->assertJsonPath('data.date', $date)
            ->assertJsonPath('data.is_closed', true)
            ->assertJsonPath('data.opens_time', null);

        $this->getJson(overrideUrl($branch))->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.date', $date);

        $this->deleteJson(overrideUrl($branch, $date))->assertOk();
        $this->getJson(overrideUrl($branch))->assertOk()->assertJsonCount(0, 'data');
    });

    it('stores special hours and replaces them when the same date is set again', function (): void {
        $branch = BranchModel::factory()->create();
        $date = futureDate();
        $this->authenticateDashboardActor($branch);

        $this->putJson(overrideUrl($branch, $date), ['is_closed' => false, 'opens_time' => '10:00', 'closes_time' => '14:00'])
            ->assertOk()
            ->assertJsonPath('data.opens_time', '10:00')
            ->assertJsonPath('data.closes_time', '14:00');
        $this->putJson(overrideUrl($branch, $date), ['opens_time' => '12:00', 'closes_time' => '16:30'])
            ->assertOk()
            ->assertJsonPath('data.is_closed', false);

        expect(BranchHoursOverrideModel::query()->where('branch_id', $branch->id)->count())->toBe(1);
        $this->getJson(overrideUrl($branch))->assertJsonPath('data.0.opens_time', '12:00')->assertJsonPath('data.0.closes_time', '16:30');
    });

    it('lists upcoming days soonest first, today included, and never past days or another branch', function (): void {
        $branch = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();
        foreach ([futureDate(5), futureDate(1), Carbon::today()->toDateString()] as $date) {
            BranchHoursOverrideModel::query()->create(['branch_id' => $branch->id, 'override_date' => $date, 'is_closed' => true]);
        }
        BranchHoursOverrideModel::query()->create(['branch_id' => $branch->id, 'override_date' => Carbon::yesterday()->toDateString(), 'is_closed' => true]);
        BranchHoursOverrideModel::query()->create(['branch_id' => $other->id, 'override_date' => futureDate(2), 'is_closed' => true]);
        $this->authenticateDashboardActor($branch);

        $dates = collect($this->getJson(overrideUrl($branch))->assertOk()->json('data'))->pluck('date')->all();

        expect($dates)->toBe([Carbon::today()->toDateString(), futureDate(1), futureDate(5)]);
    });

    it('clearing a date with no exception still answers 200 and touches no other date', function (): void {
        $branch = BranchModel::factory()->create();
        BranchHoursOverrideModel::query()->create(['branch_id' => $branch->id, 'override_date' => futureDate(4), 'is_closed' => true]);
        $this->authenticateDashboardActor($branch);

        $this->deleteJson(overrideUrl($branch, futureDate(2)))->assertOk();

        expect(BranchHoursOverrideModel::query()->count())->toBe(1);
    });

    it('validates the date and the hours', function (string $date, array $payload, int $status): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->putJson(overrideUrl($branch, $date === 'future' ? futureDate() : $date), $payload)->assertStatus($status);

        expect(BranchHoursOverrideModel::query()->count())->toBe(0);
    })->with([
        'a past date' => [Carbon::yesterday()->toDateString(), ['is_closed' => true], 422],
        'closing before opening' => ['future', ['opens_time' => '18:00', 'closes_time' => '09:00'], 422],
        'closing equals opening' => ['future', ['opens_time' => '09:00', 'closes_time' => '09:00'], 422],
        'missing times while open' => ['future', ['is_closed' => false], 422],
        'bad time format' => ['future', ['opens_time' => '9am', 'closes_time' => '5pm'], 422],
        'malformed date segment' => ['31-12-2030', ['is_closed' => true], 404],
    ]);

    it('answers 404 for a manager of another branch on list, set and clear', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson(overrideUrl($branch))->assertNotFound();
        $this->putJson(overrideUrl($branch, futureDate()), ['is_closed' => true])->assertNotFound();
        $this->deleteJson(overrideUrl($branch, futureDate()))->assertNotFound();

        expect(BranchHoursOverrideModel::query()->count())->toBe(0);
    });

    it('lets an owner and an admin manage a branch and refuses a barber and anonymous callers', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);

        $this->putJson(overrideUrl($branch, futureDate()), ['is_closed' => true])->assertUnauthorized();

        $this->authenticateDashboardActor($owner);
        $this->putJson(overrideUrl($branch, futureDate(1)), ['is_closed' => true])->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->putJson(overrideUrl($branch, futureDate(2)), ['is_closed' => true])->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(BarberModel::factory()->create());
        $this->putJson(overrideUrl($branch, futureDate(3)), ['is_closed' => true])->assertForbidden();

        expect(BranchHoursOverrideModel::query()->count())->toBe(2);
    });

    it('keeps an extra branch read-only after a multi_branch downgrade', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $original = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $extra = BranchModel::factory()->create(['brand_id' => $brand->id]);
        app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);
        $this->authenticateDashboardActor($owner);

        $this->putJson(overrideUrl($original, futureDate()), ['is_closed' => true])->assertOk();
        $this->putJson(overrideUrl($extra, futureDate()), ['is_closed' => true])->assertForbidden();
        $this->deleteJson(overrideUrl($extra, futureDate()))->assertForbidden();
        $this->getJson(overrideUrl($extra))->assertOk();

        expect(BranchHoursOverrideModel::query()->where('branch_id', $extra->id)->count())->toBe(0);
    });
});

describe('A special day changes what clients can book (NS-12)', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
        $this->date = Carbon::tomorrow()->toDateString();
    });

    it('removes every slot on a closed day and brings them back when cleared', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $this->putJson(overrideUrl($this->branch, $this->date), ['is_closed' => true])->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->actingAs(ClientModel::factory()->create(), 'client');
        expect(bookableStarts($this->branch, $this->chair, $this->service, $this->date))->toBe([]);

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor($this->branch);
        $this->deleteJson(overrideUrl($this->branch, $this->date))->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->actingAs(ClientModel::factory()->create(), 'client');
        expect(bookableStarts($this->branch, $this->chair, $this->service, $this->date))->not->toBeEmpty();
    });

    it('limits slots to the special hours and refuses a booking outside them', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $this->putJson(overrideUrl($this->branch, $this->date), ['opens_time' => '10:00', 'closes_time' => '12:00'])->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $client = ClientModel::factory()->create();
        $this->actingAs($client, 'client');
        $starts = collect(bookableStarts($this->branch, $this->chair, $this->service, $this->date))->map(fn (string $iso): string => Carbon::parse($iso)->format('H:i'));

        expect($starts)->not->toBeEmpty()
            ->and($starts->min())->toBeGreaterThanOrEqual('10:00')
            ->and($starts->max())->toBeLessThanOrEqual('11:30');

        $this->postJson('/api/v1/bookings', [
            'chair_id' => $this->chair->id,
            'starts_at' => Carbon::parse($this->date.' 15:00', 'UTC')->toIso8601ZuluString(),
            'service_ids' => [$this->service->id],
        ])->assertUnprocessable();
    });
});
