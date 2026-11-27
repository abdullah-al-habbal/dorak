<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchTimeZoneModel;
use Modules\Branch\Services\BranchTimeZones;

/** @return array<string, mixed> */
function branchPayload(BranchModel $branch, array $extra): array
{
    return [
        'brand_id' => $branch->brand_id,
        'name' => ['en' => 'Main', 'ar' => 'الرئيسي'],
        'email' => $branch->email,
        ...$extra,
    ];
}

function storedZone(BranchModel $branch): ?string
{
    return BranchTimeZoneModel::query()->where('branch_id', $branch->id)->value('time_zone');
}

describe('Dashboard branch time zone (BG-55)', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->url = "/api/v1/dashboard/branches/{$this->branch->id}";
    });

    it('saves the zone and lists it, with Asia/Damascus for a branch without one', function (): void {
        $this->authenticateDashboardActor($this->branch);

        $this->getJson('/api/v1/dashboard/branches')->assertOk()->assertJsonPath('data.0.timezone', 'Asia/Damascus');

        $this->putJson($this->url, branchPayload($this->branch, ['timezone' => 'Europe/Istanbul']))->assertOk();

        expect(storedZone($this->branch))->toBe('Europe/Istanbul');
        $this->getJson('/api/v1/dashboard/branches')->assertOk()->assertJsonPath('data.0.timezone', 'Europe/Istanbul');
    });

    it('keeps the stored zone when a save does not send one', function (): void {
        app(BranchTimeZones::class)->set($this->branch->id, 'Asia/Dubai');
        $this->authenticateDashboardActor($this->branch);

        $this->putJson($this->url, branchPayload($this->branch, []))->assertOk();

        expect(storedZone($this->branch))->toBe('Asia/Dubai');
    });

    it('rejects an unknown zone and stores nothing', function (): void {
        $this->authenticateDashboardActor($this->branch);

        $this->putJson($this->url, branchPayload($this->branch, ['timezone' => 'Mars/Olympus']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['timezone']);

        expect(storedZone($this->branch))->toBeNull();
    });

    it('does not let a manager change another branch\'s zone', function (): void {
        $other = BranchModel::factory()->create();
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("/api/v1/dashboard/branches/{$other->id}", branchPayload($other, ['timezone' => 'Asia/Dubai']))
            ->assertForbidden();

        expect(storedZone($other))->toBeNull();
    });

    it('accepts a special day on today\'s date at the branch and refuses yesterday there', function (): void {
        // 22:30 UTC on the 1st is already the 2nd in Damascus.
        $this->travelTo(Carbon::parse('2026-12-01 22:30:00', 'UTC'));
        $this->authenticateDashboardActor($this->branch);

        $this->putJson("{$this->url}/hours-overrides/2026-12-01", ['is_closed' => true])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date']);
        $this->putJson("{$this->url}/hours-overrides/2026-12-02", ['is_closed' => true])->assertOk();

        $this->getJson("{$this->url}/hours-overrides")->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.date', '2026-12-02');
    });
});
