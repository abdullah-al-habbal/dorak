<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Events\ChairStatusUpdated;
use Modules\Chair\Models\ChairModel;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

function createAuthenticatedBranch(): BranchModel
{
    $branch = BranchModel::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    return $branch;
}

describe('Branch API', function () {

    describe('POST /api/v1/branch/login', function () {
        it('returns correct response shape on success', function () {
            $branch = createAuthenticatedBranch();

            $response = $this->postJson('/api/v1/branch/login', [
                'email' => $branch->email,
                'password' => 'password123',
            ]);

            $response->assertOk();
            $json = $response->json();
            expect($json)->toHaveKeys(['success', 'statusCode', 'code', 'message', 'timestamp', 'data']);
            expect($json['data'])->toHaveKeys(['token', 'branch']);
            expect($json['data']['token'])->toBeString();
            expect($json['data']['branch'])->toHaveKeys(['id', 'name', 'email', 'status']);
        });

        it('returns 401 with invalid credentials', function () {
            $response = $this->postJson('/api/v1/branch/login', [
                'email' => 'nonexistent@test.com',
                'password' => 'wrong',
            ]);

            $response->assertUnauthorized();
        });

        it('returns 422 with missing fields', function () {
            $response = $this->postJson('/api/v1/branch/login', []);

            $response->assertStatus(422);
        });
    });

    describe('Authenticated endpoints', function () {
        beforeEach(function () {
            $this->branch = createAuthenticatedBranch();
            $this->actingAs($this->branch, 'branch_api');
        });

        describe('GET /api/v1/branch/dashboard', function () {
            it('returns dashboard stats', function () {
                $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
                ChairModel::factory()->create(['branch_id' => $this->branch->id, 'status' => ChairStatus::Available]);

                $response = $this->getJson('/api/v1/branch/dashboard');

                $response->assertOk();
                $data = $response->json('data');
                expect($data)->toHaveKeys(['today_bookings', 'active_chairs', 'total_chairs', 'pending_affiliations']);
                expect($data['total_chairs'])->toBe(2);
                expect($data['active_chairs'])->toBe(2);
                expect($data['today_bookings'])->toBeInt();
                expect($data['pending_affiliations'])->toBeInt();
            });
        });

        describe('GET /api/v1/branch/profile', function () {
            it('returns branch profile', function () {
                $response = $this->getJson('/api/v1/branch/profile');

                $response->assertOk();
                $data = $response->json('data');
                expect($data)->toHaveKeys(['id', 'name', 'email', 'status']);
                expect($data['id'])->toBe($this->branch->id);
            });
        });

        describe('PATCH /api/v1/branch/profile', function () {
            it('updates branch profile', function () {
                $response = $this->patchJson('/api/v1/branch/profile', [
                    'latitude' => 33.5,
                    'longitude' => 36.3,
                ]);

                $response->assertOk();
                $data = $response->json('data');
                expect($data['latitude'])->toBe('33.50000000');
                expect($data['longitude'])->toBe('36.30000000');
            });
        });

        describe('PATCH /api/v1/branch/chairs/{chair}/status', function () {
            it('updates chair status and fires event', function () {
                $chair = ChairModel::factory()->create([
                    'branch_id' => $this->branch->id,
                    'status' => ChairStatus::Available,
                ]);

                Event::fake();

                $response = $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", [
                    'status' => ChairStatus::Maintenance,
                ]);

                $response->assertOk();
                $data = $response->json('data');
                expect($data['status'])->toBe(ChairStatus::Maintenance->value);

                Event::assertDispatched(ChairStatusUpdated::class);
            });

            it('returns 404 for chair not belonging to branch', function () {
                $chair = ChairModel::factory()->create();

                $response = $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", [
                    'status' => ChairStatus::Maintenance,
                ]);

                $response->assertNotFound();
            });

            it('rejects invalid status', function () {
                $chair = ChairModel::factory()->create([
                    'branch_id' => $this->branch->id,
                ]);

                $response = $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", [
                    'status' => 'invalid',
                ]);

                $response->assertStatus(422);
            });
        });

        describe('GET /api/v1/branch/affiliations', function () {
            it('lists affiliations for branch', function () {
                BarberAffiliationModel::factory()->count(2)->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                ]);

                $response = $this->getJson('/api/v1/branch/affiliations');

                $response->assertOk();
                expect($response->json('data'))->toHaveCount(2);
            });

            it('returns empty array for branch with no affiliations', function () {
                $response = $this->getJson('/api/v1/branch/affiliations');

                $response->assertOk();
                expect($response->json('data'))->toHaveCount(0);
            });
        });

        describe('POST /api/v1/branch/affiliations/{affiliation}/accept', function () {
            it('accepts pending affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->pending()->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/accept");

                $response->assertOk();
                expect($response->json('data.status'))->toBe(AffiliationStatus::Active->value);
            });

            it('rejects accepting non-pending affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                    'status' => AffiliationStatus::Active,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/accept");

                $response->assertStatus(400);
            });

            it('returns 404 for affiliation not belonging to branch', function () {
                $affiliation = BarberAffiliationModel::factory()->pending()->create();

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/accept");

                $response->assertNotFound();
            });
        });

        describe('POST /api/v1/branch/affiliations/{affiliation}/reject', function () {
            it('rejects pending affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->pending()->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/reject");

                $response->assertOk();
                expect($response->json('data.status'))->toBe(AffiliationStatus::Rejected->value);
            });

            it('rejects rejecting non-pending affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                    'status' => AffiliationStatus::Active,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/reject");

                $response->assertStatus(400);
            });
        });

        describe('POST /api/v1/branch/affiliations', function () {
            it('creates a pending invite for a barber', function () {
                $barber = BarberModel::factory()->create();

                $response = $this->postJson('/api/v1/branch/affiliations', [
                    'barber_id' => $barber->id,
                ]);

                $response->assertCreated();
                expect($response->json('data.status'))->toBe(AffiliationStatus::Pending->value);
                expect($response->json('data.affiliable_id'))->toBe($this->branch->id);
            });

            it('rejects an invite for a barber that does not exist', function () {
                $response = $this->postJson('/api/v1/branch/affiliations', [
                    'barber_id' => (string) Str::uuid(),
                ]);

                $response->assertStatus(422);
            });

            it('the inviting branch cannot accept its own invite', function () {
                $barber = BarberModel::factory()->create();
                $invite = $this->postJson('/api/v1/branch/affiliations', ['barber_id' => $barber->id])->json('data');

                $response = $this->postJson("/api/v1/branch/affiliations/{$invite['id']}/accept");

                $response->assertForbidden();
            });

            it('the invited barber can accept the branch invite', function () {
                $barber = BarberModel::factory()->create();
                $invite = $this->postJson('/api/v1/branch/affiliations', ['barber_id' => $barber->id])->json('data');

                $response = $this->actingAs($barber, 'barber')
                    ->postJson("/api/v1/affiliations/{$invite['id']}/accept");

                $response->assertOk();
                expect($response->json('data.status'))->toBe(AffiliationStatus::Active->value);
            });
        });

        describe('POST /api/v1/branch/affiliations/{affiliation}/terminate', function () {
            it('terminates an active affiliation and unassigns the chair', function () {
                $barber = BarberModel::factory()->create();
                $affiliation = BarberAffiliationModel::factory()->create([
                    'barber_id' => $barber->id,
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                    'status' => AffiliationStatus::Active,
                ]);
                $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $barber->id]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/terminate");

                $response->assertOk();
                expect($response->json('data.status'))->toBe(AffiliationStatus::Terminated->value);
                $this->assertDatabaseHas('chairs', ['id' => $chair->id, 'barber_id' => null]);
            });

            it('rejects terminating a non-active affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->pending()->create([
                    'affiliable_id' => $this->branch->id,
                    'affiliable_type' => AffiliableType::Branch,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/terminate");

                $response->assertStatus(400);
            });

            it('returns 404 for a third-party branch terminating an affiliation', function () {
                $affiliation = BarberAffiliationModel::factory()->create([
                    'status' => AffiliationStatus::Active,
                ]);

                $response = $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/terminate");

                $response->assertNotFound();
            });
        });

        describe('GET /api/v1/branch/bookings', function () {
            it('lists bookings for branch chairs', function () {
                $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
                BookingModel::factory()->count(2)->create(['chair_id' => $chair->id]);

                $response = $this->getJson('/api/v1/branch/bookings');

                $response->assertOk();
                $json = $response->json();
                expect($json)->toHaveKey('meta');
                expect($json['meta']['pagination']['total'])->toBe(2);
            });
        });

        describe('GET /api/v1/branch/job-postings', function () {
            it('lists job postings for branch', function () {
                JobPostingModel::factory()->count(2)->create(['branch_id' => $this->branch->id]);

                $response = $this->getJson('/api/v1/branch/job-postings');

                $response->assertOk();
                $json = $response->json();
                expect($json)->toHaveKey('meta');
                expect($json['meta']['pagination']['total'])->toBe(2);
            });
        });

        describe('POST /api/v1/branch/job-postings', function () {
            beforeEach(fn () => app(BrandFeatures::class)->set($this->branch->brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]));

            it('creates a job posting', function () {
                $response = $this->postJson('/api/v1/branch/job-postings', [
                    'title' => ['en' => 'Barber Wanted', 'ar' => 'حلاق مطلوب'],
                    'description' => ['en' => 'We need a barber', 'ar' => 'نحتاج حلاق'],
                    'location' => 'Damascus',
                    'employment_type' => 'full-time',
                ]);

                $response->assertStatus(201);
                $data = $response->json('data');
                expect($data['title']['en'])->toBe('Barber Wanted');
                expect($data['branch_id'])->toBe($this->branch->id);
            });

            it('rejects invalid data', function () {
                $response = $this->postJson('/api/v1/branch/job-postings', [
                    'title' => [],
                ]);

                $response->assertStatus(422);
            });
        });

        describe('PUT /api/v1/branch/job-postings/{jobPosting}', function () {
            beforeEach(fn () => app(BrandFeatures::class)->set($this->branch->brand, [BrandFeatureConstants::BRAND_FEATURE_JOB_BOARD => true]));

            it('updates a job posting', function () {
                $jobPosting = JobPostingModel::factory()->create(['branch_id' => $this->branch->id]);

                $response = $this->putJson("/api/v1/branch/job-postings/{$jobPosting->id}", [
                    'title' => ['en' => 'Updated Title', 'ar' => 'عنوان محدث'],
                    'status' => JobPostingStatusEnum::Closed,
                ]);

                $response->assertOk();
                $data = $response->json('data');
                expect($data['title']['en'])->toBe('Updated Title');
            });

            it('returns 404 for posting not belonging to branch', function () {
                $jobPosting = JobPostingModel::factory()->create();

                $response = $this->putJson("/api/v1/branch/job-postings/{$jobPosting->id}", [
                    'title' => ['en' => 'Test', 'ar' => 'Test'],
                ]);

                $response->assertNotFound();
            });
        });

        describe('DELETE /api/v1/branch/job-postings/{jobPosting}', function () {
            it('soft deletes a job posting', function () {
                $jobPosting = JobPostingModel::factory()->create(['branch_id' => $this->branch->id]);

                $response = $this->deleteJson("/api/v1/branch/job-postings/{$jobPosting->id}");

                $response->assertOk();
                $this->assertDatabaseMissing('job_postings', ['id' => $jobPosting->id]);
            });
        });

        describe('GET /api/v1/branch/job-postings/{jobPosting}/applications', function () {
            it('lists applications for job posting', function () {
                $jobPosting = JobPostingModel::factory()->create(['branch_id' => $this->branch->id]);
                ApplicationModel::factory()->count(2)->create(['job_posting_id' => $jobPosting->id]);

                $response = $this->getJson("/api/v1/branch/job-postings/{$jobPosting->id}/applications");

                $response->assertOk();
                $json = $response->json();
                expect($json)->toHaveKey('meta');
                expect($json['meta']['pagination']['total'])->toBe(2);
            });

            it('returns 404 for posting not belonging to branch', function () {
                $jobPosting = JobPostingModel::factory()->create();

                $response = $this->getJson("/api/v1/branch/job-postings/{$jobPosting->id}/applications");

                $response->assertNotFound();
            });

            it('marks submitted applications as seen on the first fetch', function () {
                $jobPosting = JobPostingModel::factory()->create(['branch_id' => $this->branch->id]);
                $application = ApplicationModel::factory()->create([
                    'job_posting_id' => $jobPosting->id,
                    'status' => ApplicationStatus::Submitted,
                ]);

                $this->getJson("/api/v1/branch/job-postings/{$jobPosting->id}/applications")->assertOk();

                expect($application->fresh()->status->value)->toBe(ApplicationStatus::Seen->value);
            });
        });

        describe('GET /api/v1/branch/reviews', function () {
            it('lists reviews for branch', function () {
                ReviewModel::factory()->count(2)->create([
                    'subject_id' => $this->branch->id,
                    'subject_type' => ReviewSubjectTypeEnum::Branch,
                ]);

                $response = $this->getJson('/api/v1/branch/reviews');

                $response->assertOk();
                $json = $response->json();
                expect($json)->toHaveKey('meta');
                expect($json['meta']['pagination']['total'])->toBe(2);
            });
        });
    });

    describe('Auth enforcement', function () {
        it('requires authentication for all protected endpoints', function () {
            $endpoints = [
                ['GET', '/api/v1/branch/dashboard'],
                ['GET', '/api/v1/branch/profile'],
                ['PATCH', '/api/v1/branch/profile'],
                ['GET', '/api/v1/branch/affiliations'],
                ['GET', '/api/v1/branch/bookings'],
                ['GET', '/api/v1/branch/job-postings'],
                ['GET', '/api/v1/branch/reviews'],
            ];

            foreach ($endpoints as [$method, $uri]) {
                $response = $this->json($method, $uri);
                $response->assertUnauthorized();
            }
        });
    });
});
