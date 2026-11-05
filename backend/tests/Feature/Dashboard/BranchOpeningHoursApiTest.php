<?php

declare(strict_types=1);

use Carbon\CarbonImmutable;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;

const MONDAY = 1;

/** @return list<array<string, mixed>> */
function splitWeek(): array
{
    return [
        ['day_of_week' => 0, 'is_closed' => true],
        ['day_of_week' => MONDAY, 'shifts' => [
            ['opens_time' => '16:00', 'closes_time' => '22:00'],
            ['opens_time' => '09:00', 'closes_time' => '13:00'],
        ]],
        ['day_of_week' => 2, 'opens_time' => '10:00', 'closes_time' => '18:00'],
    ];
}

describe('Dashboard branch opening hours', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
        $this->url = "/api/v1/dashboard/branches/{$this->branch->id}/opening-hours";
    });

    it('saves split shifts, closed days and the legacy single interval, and reads them back sorted', function (): void {
        $this->authenticateDashboardActor($this->branch);

        $this->putJson($this->url, ['hours' => splitWeek()])
            ->assertOk()
            ->assertJsonCount(3, 'data.opening_hours')
            ->assertJsonPath('data.opening_hours.0.is_closed', true)
            ->assertJsonPath('data.opening_hours.0.shifts', [])
            ->assertJsonPath('data.opening_hours.1.shifts.0.opens_time', '09:00')
            ->assertJsonPath('data.opening_hours.1.shifts.1.closes_time', '22:00')
            ->assertJsonPath('data.opening_hours.1.opens_time', '09:00')
            ->assertJsonPath('data.opening_hours.1.closes_time', '22:00')
            ->assertJsonPath('data.opening_hours.2.shifts.0.closes_time', '18:00');

        $this->getJson($this->url)->assertOk()->assertJsonCount(3, 'data.opening_hours');
    });

    it('replaces a day instead of stacking shifts on repeated saves', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $this->putJson($this->url, ['hours' => splitWeek()])->assertOk();

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY, 'shifts' => [['opens_time' => '08:00', 'closes_time' => '12:00']]]]])
            ->assertOk()
            ->assertJsonCount(3, 'data.opening_hours')
            ->assertJsonCount(1, 'data.opening_hours.1.shifts');
    });

    it('rejects overlapping shifts, inverted shifts and more than four shifts', function (): void {
        $this->authenticateDashboardActor($this->branch);

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY, 'shifts' => [
            ['opens_time' => '09:00', 'closes_time' => '13:00'],
            ['opens_time' => '12:00', 'closes_time' => '15:00'],
        ]]]])->assertUnprocessable()->assertJsonValidationErrors(['hours.0.shifts']);

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY, 'shifts' => [['opens_time' => '13:00', 'closes_time' => '09:00']]]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['hours.0.shifts.0.closes_time']);

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY, 'shifts' => array_map(
            fn (int $hour): array => ['opens_time' => sprintf('%02d:00', $hour), 'closes_time' => sprintf('%02d:30', $hour)],
            [8, 10, 12, 14, 16],
        )]]])->assertUnprocessable()->assertJsonValidationErrors(['hours.0.shifts']);
    });

    it('allows back-to-back shifts and requires times for an open day', function (): void {
        $this->authenticateDashboardActor($this->branch);

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY, 'shifts' => [
            ['opens_time' => '09:00', 'closes_time' => '12:00'],
            ['opens_time' => '12:00', 'closes_time' => '15:00'],
        ]]]])->assertOk();

        $this->putJson($this->url, ['hours' => [['day_of_week' => MONDAY]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['hours.0.opens_time']);
    });

    it('keeps the full-branch PUT working with the legacy shape', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson("/api/v1/dashboard/branches/{$this->branch->id}", [
            'brand_id' => $this->branch->brand_id,
            'name' => ['en' => 'Main', 'ar' => 'الرئيسي'],
            'email' => $this->branch->email,
            'opening_hours' => [['day_of_week' => MONDAY, 'opens_time' => '10:00', 'closes_time' => '18:00']],
        ])->assertOk();

        $this->getJson($this->url)->assertOk()->assertJsonPath('data.opening_hours.0.shifts.0.opens_time', '10:00');
    });

    it('does not let a manager read or write another branch', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $other = "/api/v1/dashboard/branches/{$this->otherBranch->id}/opening-hours";

        $this->getJson($other)->assertNotFound();
        $this->putJson($other, ['hours' => splitWeek()])->assertForbidden();
    });

    it('lets a platform admin edit any branch', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson($this->url, ['hours' => splitWeek()])->assertOk();
    });

    it('covers a booking only when it fits inside a single shift', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $this->putJson($this->url, ['hours' => splitWeek()])->assertOk();
        $hours = app(BranchHours::class);
        $monday = CarbonImmutable::parse('2026-11-09 00:00:00'); // a Monday

        expect($hours->covers($this->branch->id, $monday->setTime(9, 0), $monday->setTime(10, 0)))->toBeTrue()
            ->and($hours->covers($this->branch->id, $monday->setTime(16, 30), $monday->setTime(17, 30)))->toBeTrue()
            ->and($hours->covers($this->branch->id, $monday->setTime(13, 0), $monday->setTime(14, 0)))->toBeFalse()
            ->and($hours->covers($this->branch->id, $monday->setTime(12, 30), $monday->setTime(16, 30)))->toBeFalse()
            ->and($hours->covers($this->branch->id, $monday->setTime(8, 0), $monday->setTime(9, 30)))->toBeFalse();
    });
});
