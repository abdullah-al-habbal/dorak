<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Jobs\JobApplicationStatusChangedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

const ADMIN_STAFFING_URL = '/api/v1/dashboard/branches';

/**
 * Decision of 2026-11-13: the platform admin has full permissions on barber affiliations and the job
 * board. Feature gates, lifecycle rules, validation, tenant scope and the audit trail still apply.
 */
function adminStaffingSwitchTo(AdminModel|BarberModel|BranchModel|ClientModel $actor): void
{
    app('auth')->forgetGuards();
    test()->flushHeaders();
    test()->authenticateDashboardActor($actor);
}

/** @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel} an approved brand with the job board on */
function adminStaffingWorld(bool $jobBoard = true): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => $jobBoard]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

function adminStaffingLog(BarberAffiliationModel $affiliation): StatusChangeLogModel
{
    return StatusChangeLogModel::query()->where('subject_type', 'affiliation')->where('subject_id', $affiliation->id)->latest('created_at')->firstOrFail();
}

function adminStaffingPosting(): array
{
    return ['title' => ['en' => 'Barber', 'ar' => 'حلاق'], 'description' => ['en' => 'Cut hair', 'ar' => 'قص الشعر']];
}

describe('The platform admin manages barber affiliations', function (): void {
    it('invites a barber on behalf of a branch, recorded as the admin', function (): void {
        Queue::fake();
        $world = adminStaffingWorld();
        $barber = BarberModel::factory()->create();
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);

        $id = $this->postJson(ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations", ['barber_id' => $barber->id, 'commission_percent' => 15])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->json('data.id');

        $affiliation = BarberAffiliationModel::query()->findOrFail($id);
        expect($affiliation)->barber_id->toBe($barber->id)->affiliable_id->toBe($world['branch']->id)
            ->initiated_by_type->toBe(AffiliationInitiatorTypeEnum::Branch)->initiated_by_id->toBe($world['branch']->id)
            ->and((float) $affiliation->commission_percent)->toBe(15.0)
            ->and(adminStaffingLog($affiliation))->actor_type->value->toBe('admin')->actor_id->toBe($admin->id)->to_status->toBe('pending');
        Queue::assertPushed(AffiliationInvitedNotification::class, 1);
    });

    it('keeps the duplicate, validation and downgrade rules for the admin', function (): void {
        $world = adminStaffingWorld();
        $extra = BranchModel::factory()->create(['brand_id' => $world['brand']->id]);
        $barber = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $world['branch']->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $url = ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations";

        $this->postJson($url, ['barber_id' => $barber->id])->assertStatus(409);
        $this->postJson($url, ['barber_id' => 'missing'])->assertUnprocessable()->assertJsonValidationErrors('barber_id');
        $this->postJson($url, ['barber_id' => $barber->id, 'commission_percent' => 101])->assertUnprocessable()->assertJsonValidationErrors('commission_percent');

        app(BrandFeatures::class)->set($world['brand'], [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);
        $this->postJson(ADMIN_STAFFING_URL."/{$extra->id}/affiliations", ['barber_id' => BarberModel::factory()->create()->id])
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        expect(BarberAffiliationModel::query()->count())->toBe(1);
    });

    it('accepts and rejects a barber request, recorded as the admin, and refuses what the branch could not do', function (): void {
        Queue::fake();
        $world = adminStaffingWorld();
        $accepted = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $world['branch']->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $rejected = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $world['branch']->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $ownInvite = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $world['branch']->id, 'initiated_by_id' => $world['branch']->id]);
        $active = BarberAffiliationModel::factory()->create(['affiliable_id' => $world['branch']->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations";

        $this->postJson("{$base}/{$accepted->id}/accept")->assertOk()->assertJsonPath('data.status', 'active');
        $this->postJson("{$base}/{$rejected->id}/reject")->assertOk()->assertJsonPath('data.status', 'rejected');
        $this->postJson("{$base}/{$ownInvite->id}/accept")->assertForbidden();
        $this->postJson("{$base}/{$active->id}/accept")->assertStatus(400);

        expect($accepted->fresh())->status->toBe(AffiliationStatus::Active)->accepted_at->not->toBeNull()
            ->and(adminStaffingLog($accepted))->actor_type->value->toBe('admin')->actor_id->toBe($admin->id)->from_status->toBe('pending')->to_status->toBe('active')
            ->and($rejected->fresh())->status->toBe(AffiliationStatus::Rejected)->accepted_at->toBeNull()
            ->and(adminStaffingLog($rejected))->actor_id->toBe($admin->id)->to_status->toBe('rejected')
            ->and($ownInvite->fresh()->status)->toBe(AffiliationStatus::Pending)
            ->and($active->fresh()->status)->toBe(AffiliationStatus::Active);
        Queue::assertPushed(AffiliationRespondedNotification::class, 2);
    });

    it('terminates an active affiliation, frees only that branch chairs and records the admin', function (): void {
        $world = adminStaffingWorld();
        $other = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $world['branch']->id]);
        $pending = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $world['branch']->id]);
        $here = ChairModel::factory()->create(['branch_id' => $world['branch']->id, 'barber_id' => $barber->id]);
        $elsewhere = ChairModel::factory()->create(['branch_id' => $other->id, 'barber_id' => $barber->id]);
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations";

        $this->postJson("{$base}/{$affiliation->id}/terminate")->assertOk()->assertJsonPath('data.status', 'terminated');
        $this->postJson("{$base}/{$pending->id}/terminate")->assertStatus(400);

        expect($affiliation->fresh())->status->toBe(AffiliationStatus::Terminated)->terminated_at->not->toBeNull()
            ->and($here->fresh()->barber_id)->toBeNull()
            ->and($elsewhere->fresh()->barber_id)->toBe($barber->id)
            ->and(adminStaffingLog($affiliation))->actor_type->value->toBe('admin')->actor_id->toBe($admin->id)
            ->and($pending->fresh()->status)->toBe(AffiliationStatus::Pending);
    });

    it('lists and filters any branch affiliations', function (): void {
        $world = adminStaffingWorld();
        $pending = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $world['branch']->id]);
        BarberAffiliationModel::factory()->create(['affiliable_id' => $world['branch']->id]);
        BarberAffiliationModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $url = ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations";

        expect($this->getJson($url)->assertOk()->json('data'))->toHaveCount(2)
            ->and(collect($this->getJson("{$url}?status=pending")->json('data'))->pluck('id')->all())->toBe([$pending->id]);
    });

    it('keeps the branch the actor in the log when the manager or the owner acts, and the branch scope for the admin', function (): void {
        $world = adminStaffingWorld();
        $foreign = BarberAffiliationModel::factory()->create();
        $mine = BarberAffiliationModel::factory()->create(['affiliable_id' => $world['branch']->id]);

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson(ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations/{$mine->id}/terminate")->assertOk();
        expect(adminStaffingLog($mine))->actor_type->value->toBe('branch')->actor_id->toBe($world['branch']->id);

        adminStaffingSwitchTo(AdminModel::factory()->create());
        $this->postJson(ADMIN_STAFFING_URL."/{$world['branch']->id}/affiliations/{$foreign->id}/terminate")->assertNotFound();
        $this->postJson(ADMIN_STAFFING_URL."/{$foreign->affiliable_id}/affiliations/{$mine->id}/terminate")->assertNotFound();
        $this->postJson(ADMIN_STAFFING_URL.'/00000000-0000-4000-8000-0000000000c1/affiliations', ['barber_id' => BarberModel::factory()->create()->id])->assertNotFound();

        expect($foreign->fresh()->status)->toBe(AffiliationStatus::Active);
    });
});

describe('The platform admin runs the job board', function (): void {
    it('creates, reads, edits, closes and deletes a posting for any branch', function (): void {
        $world = adminStaffingWorld();
        $foreign = BranchModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings";

        $id = $this->postJson($base, [...adminStaffingPosting(), 'branch_id' => $foreign->id, 'status' => 'closed'])->assertCreated()->assertJsonPath('data.status', 'open')->json('data.id');
        expect(JobPostingModel::query()->findOrFail($id))->branch_id->toBe($world['branch']->id)->status->toBe(JobPostingStatusEnum::Open)
            ->and(JobPostingModel::query()->where('branch_id', $foreign->id)->count())->toBe(0);

        $this->getJson($base)->assertOk()->assertJsonPath('data.0.id', $id);
        $this->putJson("{$base}/{$id}", ['description' => ['en' => 'New', 'ar' => 'جديد'], 'status' => 'closed'])->assertOk()->assertJsonPath('data.status', 'closed');
        expect(JobPostingModel::query()->findOrFail($id))->status->toBe(JobPostingStatusEnum::Closed)->getTranslation('description', 'en')->toBe('New');
        $this->putJson("{$base}/{$id}", ['status' => 'bogus'])->assertUnprocessable();
        $this->postJson($base, ['title' => ['en' => 'x']])->assertUnprocessable()->assertJsonValidationErrors(['title.ar', 'description']);

        $this->deleteJson("{$base}/{$id}")->assertOk();
        $this->assertDatabaseMissing('job_postings', ['id' => $id]);
    });

    it('still needs the brand\'s job_board feature for creating and editing', function (): void {
        $world = adminStaffingWorld(jobBoard: false);
        $existing = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings";

        $this->postJson($base, adminStaffingPosting())->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        $this->putJson("{$base}/{$existing->id}", ['status' => 'closed'])->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        expect(JobPostingModel::query()->count())->toBe(1)
            ->and($existing->fresh()->status)->toBe(JobPostingStatusEnum::Open);
    });

    it('deletes a posting with its applications and nothing else, and keeps posting ownership by branch', function (): void {
        $world = adminStaffingWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $foreign = JobPostingModel::factory()->create();
        $foreignApplication = ApplicationModel::factory()->create(['job_posting_id' => $foreign->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings";

        $this->deleteJson("{$base}/{$foreign->id}")->assertNotFound();
        $this->putJson("{$base}/{$foreign->id}", ['status' => 'closed'])->assertNotFound();
        $this->getJson("{$base}/{$foreign->id}/applications")->assertNotFound();
        $this->deleteJson("{$base}/{$posting->id}")->assertOk();

        $this->assertDatabaseMissing('job_applications', ['id' => $application->id]);
        $this->assertDatabaseHas('job_postings', ['id' => $foreign->id]);
        $this->assertDatabaseHas('job_applications', ['id' => $foreignApplication->id]);
    });

    it('lists applications, marks them seen and applies only valid status transitions', function (): void {
        Queue::fake();
        $world = adminStaffingWorld();
        $posting = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);
        $first = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $second = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $stray = ApplicationModel::factory()->create(['job_posting_id' => JobPostingModel::factory()->create(['branch_id' => $world['branch']->id])->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $base = ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings/{$posting->id}/applications";

        expect(collect($this->getJson($base)->assertOk()->json('data'))->pluck('id')->all())->toEqualCanonicalizing([$first->id, $second->id]);
        $this->postJson("{$base}/mark-seen")->assertOk()->assertJsonPath('data.updated', 2);
        expect($first->fresh()->status)->toBe(ApplicationStatus::Seen)->and($stray->fresh()->status)->toBe(ApplicationStatus::Submitted);

        $this->patchJson("{$base}/{$first->id}/status", ['status' => 'accepted'])->assertOk()->assertJsonPath('data.status', 'accepted');
        $this->patchJson("{$base}/{$first->id}/status", ['status' => 'rejected'])->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->patchJson("{$base}/{$second->id}/status", ['status' => 'submitted'])->assertUnprocessable();
        $this->patchJson("{$base}/{$second->id}/status", ['status' => 'hired'])->assertUnprocessable();
        $this->patchJson("{$base}/{$stray->id}/status", ['status' => 'accepted'])->assertNotFound();

        expect($first->fresh()->status)->toBe(ApplicationStatus::Accepted)
            ->and($second->fresh()->status)->toBe(ApplicationStatus::Seen)
            ->and($stray->fresh()->status)->toBe(ApplicationStatus::Submitted);
        Queue::assertPushed(JobApplicationStatusChangedNotification::class, 1);
    });
});

describe('Everyone else keeps exactly the access they had', function (): void {
    it('answers 401 to anonymous callers and 403 to a barber on every affiliation and job-board route', function (): void {
        $world = adminStaffingWorld();
        $branch = $world['branch']->id;
        $posting = JobPostingModel::factory()->create(['branch_id' => $branch]);
        $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
        $affiliation = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch]);
        $base = ADMIN_STAFFING_URL."/{$branch}";
        $routes = [
            ['getJson', "{$base}/affiliations", []],
            ['postJson', "{$base}/affiliations", ['barber_id' => $affiliation->barber_id]],
            ['postJson', "{$base}/affiliations/{$affiliation->id}/accept", []],
            ['postJson', "{$base}/affiliations/{$affiliation->id}/reject", []],
            ['postJson', "{$base}/affiliations/{$affiliation->id}/terminate", []],
            ['getJson', "{$base}/job-postings", []],
            ['postJson', "{$base}/job-postings", adminStaffingPosting()],
            ['putJson', "{$base}/job-postings/{$posting->id}", ['status' => 'closed']],
            ['deleteJson', "{$base}/job-postings/{$posting->id}", []],
            ['getJson', "{$base}/job-postings/{$posting->id}/applications", []],
            ['postJson', "{$base}/job-postings/{$posting->id}/applications/mark-seen", []],
            ['patchJson', "{$base}/job-postings/{$posting->id}/applications/{$application->id}/status", ['status' => 'accepted']],
        ];

        foreach ($routes as [$method, $url, $payload]) {
            $this->{$method}($url, $payload)->assertUnauthorized();
        }
        adminStaffingSwitchTo(BarberModel::factory()->create());
        foreach ($routes as [$method, $url, $payload]) {
            $this->{$method}($url, $payload)->assertForbidden();
        }

        expect($posting->fresh())->not->toBeNull()
            ->and($application->fresh()->status)->toBe(ApplicationStatus::Submitted)
            ->and($affiliation->fresh()->status)->toBe(AffiliationStatus::Pending);
    });

    it('keeps managers and owners inside their own scope', function (): void {
        $world = adminStaffingWorld();
        $foreign = adminStaffingWorld();
        $own = JobPostingModel::factory()->create(['branch_id' => $world['branch']->id]);

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson(ADMIN_STAFFING_URL."/{$foreign['branch']->id}/job-postings", adminStaffingPosting())->assertNotFound();
        $this->getJson(ADMIN_STAFFING_URL."/{$foreign['branch']->id}/affiliations")->assertNotFound();
        $this->putJson(ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings/{$own->id}", ['status' => 'closed'])->assertOk();

        adminStaffingSwitchTo($foreign['branch']);
        $this->putJson(ADMIN_STAFFING_URL."/{$world['branch']->id}/job-postings/{$own->id}", ['status' => 'open'])->assertNotFound();
        expect($own->fresh()->status)->toBe(JobPostingStatusEnum::Closed);
    });

    it('grants staffing rights to the admin, the manager and the owner and to nobody else', function (): void {
        $can = fn (DashboardActorTypeEnum $type): bool => (new DashboardActor('id', $type, 'role'))->canManageStaffing();

        expect($can(DashboardActorTypeEnum::Admin))->toBeTrue()
            ->and($can(DashboardActorTypeEnum::Branch))->toBeTrue()
            ->and($can(DashboardActorTypeEnum::Owner))->toBeTrue()
            ->and($can(DashboardActorTypeEnum::Barber))->toBeFalse();
    });
});
