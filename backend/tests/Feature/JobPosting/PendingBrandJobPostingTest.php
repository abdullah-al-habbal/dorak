<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/**
 * Batch 1 (WP-1, decision 5): a Pending brand cannot create or edit a posting, whoever acts (the platform
 * admin approves the brand first). Deleting a posting and deciding on applications stay open.
 *
 * @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel}
 */
function pendingPostingWorld(bool $pending = true): array
{
    $owner = ClientModel::factory()->create();
    $brand = $pending ? BrandModel::factory()->pending()->create(['owner_id' => $owner->id]) : BrandModel::factory()->create(['owner_id' => $owner->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

function pendingPostingBody(): array
{
    return ['title' => ['en' => 'Barber', 'ar' => 'حلاق'], 'description' => ['en' => 'Cut hair', 'ar' => 'قص الشعر']];
}

function pendingPostingSwitchTo(AdminModel|BranchModel|ClientModel $actor): void
{
    app('auth')->forgetGuards();
    test()->flushHeaders();
    test()->authenticateDashboardActor($actor);
}

describe('A Pending brand cannot publish postings', function (): void {
    it('refuses create and edit to the owner, the manager and the admin in the dashboard, writing nothing', function (): void {
        $world = pendingPostingWorld();
        $existing = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $url = "/api/v1/dashboard/branches/{$world['branch']->id}/job-postings";

        foreach ([$world['owner'], $world['branch'], AdminModel::factory()->create()] as $actor) {
            pendingPostingSwitchTo($actor);
            $this->postJson($url, pendingPostingBody())->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
            $this->putJson("{$url}/{$existing->id}", ['title' => ['en' => 'Changed', 'ar' => 'تغيير']])->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
        }

        expect(JobPostingModel::query()->count())->toBe(1)->and($existing->fresh()->getTranslation('title', 'en'))->not->toBe('Changed');
    });

    it('keeps the branch account closed over the branch API while Pending, writing nothing', function (): void {
        $world = pendingPostingWorld();
        $existing = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $this->actingAs($world['branch'], 'branch_api');

        // The account is inactive until approval, so the route middleware answers first; the guard inside
        // the Create/Update actions is the second line behind it.
        $this->postJson('/api/v1/branch/job-postings', pendingPostingBody())->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
        $this->putJson("/api/v1/branch/job-postings/{$existing->id}", ['title' => ['en' => 'Changed', 'ar' => 'تغيير']])->assertForbidden();

        expect(JobPostingModel::query()->count())->toBe(1)->and($existing->fresh()->getTranslation('title', 'en'))->not->toBe('Changed');
    });

    it('still lets the owner and the admin delete a posting and decide on its applications in the dashboard', function (): void {
        $world = pendingPostingWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $other = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $base = "/api/v1/dashboard/branches/{$world['branch']->id}/job-postings";

        pendingPostingSwitchTo($world['owner']);
        $this->patchJson("{$base}/{$posting->id}/applications/{$application->id}/status", ['status' => ApplicationStatus::Rejected])->assertOk();
        $this->deleteJson("{$base}/{$other->id}")->assertOk();

        expect($application->fresh()->status)->toBe(ApplicationStatus::Rejected)->and(JobPostingModel::query()->whereKey($other->id)->exists())->toBeFalse();

        pendingPostingSwitchTo(AdminModel::factory()->create());
        $this->deleteJson("{$base}/{$posting->id}")->assertOk();
    });

    it('lets an approved brand publish and edit as before', function (): void {
        $world = pendingPostingWorld(pending: false);
        $base = "/api/v1/dashboard/branches/{$world['branch']->id}/job-postings";

        pendingPostingSwitchTo($world['owner']);
        $id = $this->postJson($base, pendingPostingBody())->assertCreated()->json('data.id');
        $this->putJson("{$base}/{$id}", ['title' => ['en' => 'Changed', 'ar' => 'تغيير']])->assertOk();

        $this->actingAs($world['branch'], 'branch_api');
        $this->postJson('/api/v1/branch/job-postings', pendingPostingBody())->assertCreated();
    });

    it('publishes again once the platform approves the brand', function (): void {
        $world = pendingPostingWorld();
        $url = "/api/v1/dashboard/branches/{$world['branch']->id}/job-postings";
        pendingPostingSwitchTo($world['owner']);
        $this->postJson($url, pendingPostingBody())->assertForbidden();

        $world['brand']->update(['status' => 'active']);

        $this->postJson($url, pendingPostingBody())->assertCreated();
    });
});
