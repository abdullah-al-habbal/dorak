<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Jobs\JobApplicationReceivedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;

/**
 * Batch 1 (WP-1): only an Active brand exposes postings or takes applications. Pending, Suspended and
 * Rejected brands (and a posting whose branch was deleted) stay off the public board.
 */
function publicBoardPosting(?BrandStatusEnum $status): JobPostingModel
{
    $branchId = $status === null
        ? null
        : BranchModel::factory()->create(['brand_id' => BrandModel::factory()->create(['status' => $status])->id])->id;

    return JobPostingModel::factory()->create(['branch_id' => $branchId, 'status' => JobPostingStatusEnum::Open]);
}

describe('The public job board follows the brand status', function (): void {
    it('lists and shows the postings of an Active brand only', function (): void {
        $visible = publicBoardPosting(BrandStatusEnum::Active);
        $hidden = [
            publicBoardPosting(BrandStatusEnum::Pending),
            publicBoardPosting(BrandStatusEnum::Suspended),
            publicBoardPosting(BrandStatusEnum::Rejected),
            publicBoardPosting(null),
        ];

        $ids = collect($this->getJson('/api/v1/jobs')->assertOk()->json('data'))->pluck('id')->all();
        expect($ids)->toBe([$visible->id]);

        $this->getJson("/api/v1/jobs/{$visible->id}")->assertOk();
        foreach ($hidden as $posting) {
            $this->getJson("/api/v1/jobs/{$posting->id}")->assertNotFound();
        }
    });

    it('shows a posting again once its brand is approved and hides it when the brand is suspended', function (): void {
        $posting = publicBoardPosting(BrandStatusEnum::Pending);
        $this->getJson("/api/v1/jobs/{$posting->id}")->assertNotFound();

        $posting->branch->brand->update(['status' => BrandStatusEnum::Active]);
        $this->getJson("/api/v1/jobs/{$posting->id}")->assertOk();

        $posting->branch->brand->update(['status' => BrandStatusEnum::Suspended]);
        $this->getJson("/api/v1/jobs/{$posting->id}")->assertNotFound();
    });
});

describe('Applying follows the brand status', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        $this->barber = BarberModel::factory()->create();
        $this->actingAs($this->barber, 'barber');
    });

    it('takes an application for an Active brand and queues one notice', function (): void {
        $posting = publicBoardPosting(BrandStatusEnum::Active);

        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();

        expect(ApplicationModel::query()->where('job_posting_id', $posting->id)->count())->toBe(1);
        Queue::assertPushed(JobApplicationReceivedNotification::class, 1);
    });

    it('refuses an application for a brand that is not Active, with the same answer as a closed posting, and stores nothing', function (?BrandStatusEnum $status): void {
        $posting = publicBoardPosting($status);
        $closed = JobPostingModel::factory()->create(['status' => JobPostingStatusEnum::Closed]);

        $refused = $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertUnprocessable();
        $closedResponse = $this->postJson("/api/v1/jobs/{$closed->id}/apply")->assertUnprocessable();

        expect($refused->json('message'))->toBe($closedResponse->json('message'))
            ->and(ApplicationModel::query()->count())->toBe(0);
        Queue::assertNotPushed(JobApplicationReceivedNotification::class);
    })->with([
        'pending' => BrandStatusEnum::Pending,
        'suspended' => BrandStatusEnum::Suspended,
        'rejected' => BrandStatusEnum::Rejected,
        'no branch' => null,
    ]);

    it('keeps past applications visible to the barber after the brand is suspended', function (): void {
        $posting = publicBoardPosting(BrandStatusEnum::Active);
        $this->postJson("/api/v1/jobs/{$posting->id}/apply")->assertCreated();
        $posting->branch->brand->update(['status' => BrandStatusEnum::Suspended]);

        $ids = collect($this->getJson('/api/v1/applications')->assertOk()->json('data'))->pluck('job_posting_id')->all();

        expect($ids)->toBe([$posting->id]);
    });
});
