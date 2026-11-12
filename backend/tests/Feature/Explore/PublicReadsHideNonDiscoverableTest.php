<?php

declare(strict_types=1);

use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('public reads never reach non-discoverable records', function () {
    it('hides a chair of a pending branch', function () {
        $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Pending]);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);

        $this->getJson("/api/v1/chairs/{$chair->id}")->assertNotFound();
        $this->getJson("/api/v1/branches/{$branch->id}/chairs")->assertOk()->assertJsonCount(0, 'data');
        expect(collect($this->getJson('/api/v1/chairs')->json('data'))->pluck('id')->all())->not->toContain($chair->id);
    });

    it('conceals a rejected barber seated at a discoverable branch', function () {
        $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Enabled]);
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Rejected, 'rejection_reason' => 'secret reason']);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);

        $show = $this->getJson("/api/v1/chairs/{$chair->id}")->assertOk();
        expect($show->json('data.barber'))->toBeNull();
        expect($show->getContent())->not->toContain('secret reason');

        $list = $this->getJson("/api/v1/branches/{$branch->id}/chairs")->assertOk();
        expect($list->json('data.0.barber'))->toBeNull();
        expect($list->getContent())->not->toContain('secret reason');
    });

    it('still serves a chair of a discoverable branch', function () {
        $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Enabled]);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);

        $this->getJson("/api/v1/chairs/{$chair->id}")->assertOk()->assertJsonPath('data.id', $chair->id);
    });

    it('hides closed and archived job postings by id but serves open ones', function () {
        $closed = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Closed]);
        $archived = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Archived]);
        $open = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Open]);

        $this->getJson("/api/v1/jobs/{$closed->id}")->assertNotFound();
        $this->getJson("/api/v1/jobs/{$archived->id}")->assertNotFound();
        $this->getJson("/api/v1/jobs/{$open->id}")->assertOk();
    });

    it('hides services, reviews and slots of a disabled barber', function () {
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Disabled]);

        $this->getJson("/api/v1/barbers/{$barber->id}/services")->assertNotFound();
        $this->getJson("/api/v1/barbers/{$barber->id}/reviews")->assertNotFound();
        $service = OfferedServiceModel::factory()->create(['duration_minutes' => 30]);
        $slots = '/api/v1/barbers/'.$barber->id.'/slots?'.http_build_query([
            'date' => now()->addDay()->format('Y-m-d'),
            'service_ids' => [$service->id],
        ]);
        $this->getJson($slots)->assertNotFound();
    });

    it('serves services and reviews of an enabled barber', function () {
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);

        $this->getJson("/api/v1/barbers/{$barber->id}/services")->assertOk();
        $this->getJson("/api/v1/barbers/{$barber->id}/reviews")->assertOk();
    });

    it('lets a deactivated barber still read their own reviews', function () {
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Disabled]);
        $this->actingAs($barber, 'barber');

        $this->getJson("/api/v1/barbers/{$barber->id}/reviews")->assertOk();
    });

    it('does not let another barber read a hidden barber\'s reviews', function () {
        $hidden = BarberModel::factory()->create(['status' => BarberStatusEnum::Disabled]);
        $other = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);
        $this->actingAs($other, 'barber');

        $this->getJson("/api/v1/barbers/{$hidden->id}/reviews")->assertNotFound();
    });

    it('hides reviews of a pending branch but serves an enabled one', function () {
        $pending = BranchModel::factory()->create(['status' => BranchStatusEnum::Pending]);
        $enabled = BranchModel::factory()->create(['status' => BranchStatusEnum::Enabled]);

        $this->getJson("/api/v1/branches/{$pending->id}/reviews")->assertNotFound();
        $this->getJson("/api/v1/branches/{$enabled->id}/reviews")->assertOk();
    });

    it('omits inactive brands from a barber\'s workplaces', function () {
        $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);
        $brand = BrandModel::factory()->create(['status' => BrandStatusEnum::Suspended]);
        BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_type' => AffiliableType::Brand,
            'affiliable_id' => $brand->id,
            'status' => AffiliationStatus::Active,
        ]);

        $workplaces = $this->getJson("/api/v1/explore/barbers/{$barber->id}")->assertOk()->json('data.workplaces');

        expect(collect($workplaces)->pluck('id')->all())->not->toContain($brand->id);
    });
});
