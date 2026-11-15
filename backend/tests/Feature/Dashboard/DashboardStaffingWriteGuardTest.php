<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\OfferedService\Models\OfferedServiceModel;

/** S5 (F-01 staffing and brand level): staffing, dispute, override and brand writes obey the guard; POST /brands and resubmit stay open. */
function staffingWorld(BrandStatusEnum $brand = BrandStatusEnum::Active, BranchStatusEnum $branch = BranchStatusEnum::Enabled): array
{
    $owner = ClientModel::factory()->create();
    $brandModel = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $brand]);
    $branchModel = BranchModel::factory()->create(['brand_id' => $brandModel->id, 'status' => $branch]);
    $barber = BarberModel::factory()->create();
    BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $brandModel->id, 'affiliable_type' => AffiliableType::Brand]);

    return [
        'owner' => $owner,
        'brand' => $brandModel,
        'branch' => $branchModel,
        'barber' => $barber,
        'service' => OfferedServiceModel::factory()->create(['serviceable_id' => $brandModel->id]),
    ];
}

/** @return array<string, array{0: string, 1: Closure(array<string, mixed>): string, 2: Closure(array<string, mixed>): array<string, mixed>}> */
function staffingWriteRoutes(): array
{
    $base = '/api/v1/dashboard';
    $missing = '00000000-0000-4000-8000-000000000001';
    $posting = ['title' => ['en' => 'Barber', 'ar' => 'حلاق'], 'description' => ['en' => 'Cut hair', 'ar' => 'قص الشعر']];

    return [
        'invite affiliation' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/affiliations", fn (array $w) => ['barber_id' => BarberModel::factory()->create()->id]],
        'accept affiliation' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/affiliations/{$missing}/accept", fn () => []],
        'terminate affiliation' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/affiliations/{$missing}/terminate", fn () => []],
        'store job posting' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/job-postings", fn () => $posting],
        'update job posting' => ['PUT', fn (array $w) => "{$base}/branches/{$w['branch']->id}/job-postings/{$missing}", fn () => $posting],
        'delete job posting' => ['DELETE', fn (array $w) => "{$base}/branches/{$w['branch']->id}/job-postings/{$missing}", fn () => []],
        'mark applications seen' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/job-postings/{$missing}/applications/mark-seen", fn () => []],
        'application status' => ['PATCH', fn (array $w) => "{$base}/branches/{$w['branch']->id}/job-postings/{$missing}/applications/{$missing}/status", fn () => ['status' => ApplicationStatus::Accepted->value]],
        'dispute review' => ['POST', fn (array $w) => "{$base}/branches/{$w['branch']->id}/reviews/{$missing}/dispute", fn () => ['reason' => 'This review is not about us at all.']],
    ];
}

describe('Staffing writes on a Suspended brand or branch (F-01, S5)', function (): void {
    it('refuses staffing and dispute writes on a Suspended brand', function (string $route): void {
        [$method, $url, $payload] = staffingWriteRoutes()[$route];
        $world = staffingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->json($method, $url($world), $payload($world))->assertForbidden()->assertJsonPath('code', 'brand_suspended');
    })->with(fn () => array_keys(staffingWriteRoutes()));

    it('refuses staffing and dispute writes on a Suspended branch of an active brand', function (string $route): void {
        [$method, $url, $payload] = staffingWriteRoutes()[$route];
        $world = staffingWorld(branch: BranchStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->json($method, $url($world), $payload($world))->assertForbidden()->assertJsonPath('code', 'branch_read_only');
    })->with(fn () => array_keys(staffingWriteRoutes()));

    it('keeps a not-found posting a 404 on an active branch, so the guard is the only new refusal', function (): void {
        $world = staffingWorld();
        $this->authenticateDashboardActor($world['owner']);

        $this->deleteJson("/api/v1/dashboard/branches/{$world['branch']->id}/job-postings/00000000-0000-4000-8000-000000000001")->assertNotFound();
    });

    it('still lets the platform admin act on a Suspended brand', function (): void {
        $world = staffingWorld(BrandStatusEnum::Suspended, BranchStatusEnum::Suspended);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->deleteJson("/api/v1/dashboard/branches/{$world['branch']->id}/job-postings/00000000-0000-4000-8000-000000000001")->assertNotFound();
    });
});

describe('Brand-level writes on a Suspended brand (F-01, S5)', function (): void {
    it('refuses a barber service override and a brand update', function (): void {
        $world = staffingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);
        $url = "/api/v1/dashboard/barbers/{$world['barber']->id}/services/{$world['service']->id}/override";

        $this->putJson($url, ['brand_id' => $world['brand']->id, 'price_amount_minor' => 900])->assertForbidden()->assertJsonPath('code', 'brand_suspended');
        $this->deleteJson($url, ['brand_id' => $world['brand']->id])->assertForbidden()->assertJsonPath('code', 'brand_suspended');
        $this->putJson("/api/v1/dashboard/brands/{$world['brand']->id}", ['name' => ['en' => 'Renamed', 'ar' => 'جديد']])->assertForbidden()->assertJsonPath('code', 'brand_suspended');
    });

    it('lets the owner of a Suspended brand open another brand (decision A, point 3)', function (): void {
        $world = staffingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson('/api/v1/dashboard/brands', ['name' => ['en' => 'Second', 'ar' => 'ثاني'], 'base_currency_code' => $world['brand']->base_currency_code])
            ->assertStatus(201);
    });

    it('answers resubmit of a Suspended brand with the not-rejected rule, not a lifecycle refusal', function (): void {
        $world = staffingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson("/api/v1/dashboard/brands/{$world['brand']->id}/resubmit")->assertStatus(409);
    });
});
