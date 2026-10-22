<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\NotificationModel;
use Modules\Core\Services\FcmNotificationSender;
use Modules\JobPosting\Jobs\JobApplicationReceivedNotification;
use Modules\JobPosting\Jobs\JobApplicationStatusChangedNotification;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Review\Jobs\ReviewRequestNotification;

beforeEach(function (): void {
    Queue::fake();
});

it('queues one invitation to the branch when a barber requests to affiliate', function (): void {
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $this->actingAs($barber, 'barber');

    $this->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $branch->id, 'affiliable_type' => 'branch'])->assertCreated();

    Queue::assertPushed(AffiliationInvitedNotification::class, 1);
});

it('queues no invitation when the affiliation request is invalid or forbidden', function (): void {
    $barber = BarberModel::factory()->create();
    $this->actingAs($barber, 'barber');

    $this->postJson("/api/v1/barbers/{$barber->id}/affiliate", [])->assertUnprocessable();
    $this->postJson('/api/v1/barbers/'.BarberModel::factory()->create()->id.'/affiliate', ['affiliable_id' => BranchModel::factory()->create()->id, 'affiliable_type' => 'branch'])->assertForbidden();

    Queue::assertNothingPushed();
});

it('queues one response when a barber accepts or rejects', function (string $action): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create(['barber_id' => $barber->id]);
    $this->actingAs($barber, 'barber');

    $this->postJson("/api/v1/affiliations/{$affiliation->id}/{$action}")->assertOk();

    Queue::assertPushed(AffiliationRespondedNotification::class, 1);
})->with(['accept', 'reject']);

it('queues one response when a branch accepts or rejects', function (string $action): void {
    $branch = BranchModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id]);
    $this->actingAs($branch, 'branch_api');

    $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/{$action}")->assertOk();

    Queue::assertPushed(AffiliationRespondedNotification::class, 1);
})->with(['accept', 'reject']);

it('queues no response for a non-pending affiliation', function (): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->create(['barber_id' => $barber->id]);
    $this->actingAs($barber, 'barber');

    $this->postJson("/api/v1/affiliations/{$affiliation->id}/accept")->assertStatus(400);

    Queue::assertNothingPushed();
});

it('queues one application notification for the posting branch', function (): void {
    $barber = BarberModel::factory()->create();
    $job = JobPostingModel::factory()->create(['status' => 'open']);
    $this->actingAs($barber, 'barber');

    $this->postJson("/api/v1/jobs/{$job->id}/apply")->assertCreated();

    Queue::assertPushed(JobApplicationReceivedNotification::class, 1);
});

it('queues no application notification for closed jobs or duplicates', function (): void {
    $this->actingAs(BarberModel::factory()->create(), 'barber');
    $closed = JobPostingModel::factory()->create(['status' => 'closed']);
    $open = JobPostingModel::factory()->create(['status' => 'open']);

    $this->postJson("/api/v1/jobs/{$closed->id}/apply")->assertUnprocessable();
    Queue::assertNothingPushed();

    $this->postJson("/api/v1/jobs/{$open->id}/apply")->assertCreated();
    $this->postJson("/api/v1/jobs/{$open->id}/apply")->assertUnprocessable();
    Queue::assertPushed(JobApplicationReceivedNotification::class, 1);
});

it('queues one status notification for the applying barber and none on failure', function (): void {
    $branch = BranchModel::factory()->create();
    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
    $url = "/api/v1/branch/job-postings/{$posting->id}/applications/{$application->id}/status";
    $this->actingAs($branch, 'branch_api');

    $this->patchJson($url, ['status' => 'bogus'])->assertUnprocessable();
    Queue::assertNothingPushed();

    $this->patchJson($url, ['status' => 'accepted'])->assertOk();
    $this->patchJson($url, ['status' => 'rejected'])->assertUnprocessable();
    Queue::assertPushed(JobApplicationStatusChangedNotification::class, 1);
});

it('queues no status notification for another branch', function (): void {
    $posting = JobPostingModel::factory()->create();
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id]);
    $this->actingAs(BranchModel::factory()->create(), 'branch_api');

    $this->patchJson("/api/v1/branch/job-postings/{$posting->id}/applications/{$application->id}/status", ['status' => 'accepted'])->assertForbidden();

    Queue::assertNothingPushed();
});

it('queues one review request when a booking completes', function (): void {
    $barber = BarberModel::factory()->create();
    $booking = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::InProgress]);
    $this->actingAs($barber, 'barber');

    $this->patchJson("/api/v1/barber/bookings/{$booking->id}/complete")->assertOk();

    Queue::assertPushed(ReviewRequestNotification::class, 1);
});

it('queues no review request for other transitions or rejected completion', function (): void {
    $barber = BarberModel::factory()->create();
    $started = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::Confirmed]);
    $pending = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::Pending]);
    $this->actingAs($barber, 'barber');

    $this->patchJson("/api/v1/barber/bookings/{$started->id}/start")->assertOk();
    $this->patchJson("/api/v1/barber/bookings/{$pending->id}/complete")->assertStatus(422);

    Queue::assertNotPushed(ReviewRequestNotification::class);
});

it('writes an inbox row with an id-only payload for each notification', function (): void {
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $sender = app(FcmNotificationSender::class);

    $branchAffiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $barber->id,
        'initiated_by_type' => BarberModel::class,
        'initiated_by_id' => $barber->id,
        'affiliable_id' => $branch->id,
    ]);
    (new AffiliationInvitedNotification($branchAffiliation->id))->handle($sender);
    (new AffiliationRespondedNotification($branchAffiliation->id, true))->handle($sender);

    $posting = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
    $application = ApplicationModel::factory()->create(['job_posting_id' => $posting->id, 'barber_id' => $barber->id]);
    (new JobApplicationReceivedNotification($application->id))->handle($sender);
    (new JobApplicationStatusChangedNotification($application->id))->handle($sender);

    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $client = ClientModel::factory()->create();
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'client_id' => $client->id, 'status' => BookingStatus::Completed]);
    (new ReviewRequestNotification($booking->id))->handle($sender);

    $forBranch = NotificationModel::query()->where('notifiable_type', $branch->getMorphClass())->where('notifiable_id', $branch->id)->get();
    expect($forBranch->pluck('type')->map->value->sort()->values()->all())->toBe(['application', 'invite']);

    $forBarber = NotificationModel::query()->where('notifiable_type', $barber->getMorphClass())->where('notifiable_id', $barber->id)->get();
    expect($forBarber->pluck('type')->map->value->sort()->values()->all())->toBe(['application', 'invite']);
    expect($forBarber->firstWhere('type', NotificationTypeEnum::Invite)->data)->toMatchArray(['affiliation_id' => $branchAffiliation->id, 'status' => 'accepted']);

    $review = NotificationModel::query()->where('notifiable_type', $client->getMorphClass())->where('notifiable_id', $client->id)->sole();
    expect($review->type)->toBe(NotificationTypeEnum::ReviewRequest)
        ->and($review->data)->toBe(['type' => 'review_request', 'event' => 'review_request', 'booking_id' => $booking->id]);
});

it('does not send a review request for a booking without a branch to review', function (): void {
    $client = ClientModel::factory()->create();
    $booking = BookingModel::factory()->create(['chair_id' => null, 'client_id' => $client->id, 'status' => BookingStatus::Completed]);

    (new ReviewRequestNotification($booking->id))->handle(app(FcmNotificationSender::class));

    expect(NotificationModel::query()->where('notifiable_id', $client->id)->count())->toBe(0);
});

it('notifies the barber when a branch invited them', function (): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create(['barber_id' => $barber->id]);

    (new AffiliationInvitedNotification($affiliation->id))->handle(app(FcmNotificationSender::class));

    expect(NotificationModel::query()->where('notifiable_id', $barber->id)->sole()->type)->toBe(NotificationTypeEnum::Invite);
});
