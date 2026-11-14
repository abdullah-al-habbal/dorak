<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/**
 * Batch 1 remediation: a branch or brand owner cannot read, edit, delete or decide on another branch's job
 * postings and applications, and a refusal leaves every row and the audit log untouched and sends no notice.
 * A control request from the real owner runs first, so a refusal cannot be a mistyped URL.
 */
function crossTenantJobWorld(): array
{
    $make = function (): array {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);

        return ['owner' => $owner, 'branch' => $branch, 'posting' => $posting, 'application' => ApplicationModel::factory()->create(['job_posting_id' => $posting->id])];
    };

    return ['mine' => $make(), 'theirs' => $make()];
}

/** @return array{postings: array<int, object>, applications: array<int, object>, logs: int} */
function crossTenantJobSnapshot(): array
{
    return [
        'postings' => DB::table('job_postings')->orderBy('id')->get()->all(),
        'applications' => DB::table('job_applications')->orderBy('id')->get()->all(),
        'logs' => DB::table('status_change_logs')->count(),
    ];
}

describe('Branch API', function (): void {
    it('answers 404 to another branch for update, delete, list, mark-seen and decisions, and changes nothing', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $world = crossTenantJobWorld();
        $mine = $world['mine'];
        $theirs = $world['theirs'];
        $this->actingAs($mine['branch'], 'branch_api');
        $this->getJson("/api/v1/branch/job-postings/{$mine['posting']->id}/applications")->assertOk();
        $this->postJson("/api/v1/branch/job-postings/{$mine['posting']->id}/applications/mark-seen")->assertOk();
        $this->patchJson("/api/v1/branch/job-postings/{$mine['posting']->id}/applications/{$mine['application']->id}/status", ['status' => ApplicationStatus::Rejected])->assertOk();
        $this->putJson("/api/v1/branch/job-postings/{$mine['posting']->id}", ['status' => 'closed'])->assertOk();
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $before = crossTenantJobSnapshot();
        $url = "/api/v1/branch/job-postings/{$theirs['posting']->id}";

        $this->putJson($url, ['status' => 'closed', 'title' => ['en' => 'Hijacked', 'ar' => 'مخترق']])->assertNotFound();
        $this->deleteJson($url)->assertNotFound();
        $this->getJson("{$url}/applications")->assertNotFound();
        $this->postJson("{$url}/applications/mark-seen")->assertNotFound();
        $this->patchJson("{$url}/applications/{$theirs['application']->id}/status", ['status' => ApplicationStatus::Accepted])->assertForbidden();

        expect(crossTenantJobSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });
});

describe('Dashboard', function (): void {
    it('answers 404 to another brand\'s owner on a foreign branch and on his own branch, and changes nothing', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $world = crossTenantJobWorld();
        $mine = $world['mine'];
        $theirs = $world['theirs'];
        $this->authenticateDashboardActor($mine['owner']);
        $own = "/api/v1/dashboard/branches/{$mine['branch']->id}/job-postings/{$mine['posting']->id}";
        $this->getJson("{$own}/applications")->assertOk();
        $this->postJson("{$own}/applications/mark-seen")->assertOk();
        $this->patchJson("{$own}/applications/{$mine['application']->id}/status", ['status' => ApplicationStatus::Rejected->value])->assertOk();
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $before = crossTenantJobSnapshot();

        foreach ([$theirs['branch'], $mine['branch']] as $branch) {
            $url = "/api/v1/dashboard/branches/{$branch->id}/job-postings/{$theirs['posting']->id}";
            $this->putJson($url, ['status' => 'closed'])->assertNotFound();
            $this->deleteJson($url)->assertNotFound();
            $this->getJson("{$url}/applications")->assertNotFound();
            $this->postJson("{$url}/applications/mark-seen")->assertNotFound();
            $this->patchJson("{$url}/applications/{$theirs['application']->id}/status", ['status' => ApplicationStatus::Accepted->value])->assertNotFound();
        }
        $this->postJson("/api/v1/dashboard/branches/{$theirs['branch']->id}/job-postings", ['title' => ['en' => 'Planted', 'ar' => 'مزروع'], 'description' => ['en' => 'x', 'ar' => 'x']])->assertNotFound();
        $this->getJson("/api/v1/dashboard/branches/{$theirs['branch']->id}/job-postings")->assertNotFound();

        expect(crossTenantJobSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });
});
