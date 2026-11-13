<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Constants\DashboardBarberLookupConstants;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;
use Modules\Marketing\Models\TestimonialModel;
use Modules\Marketing\Rules\TrustedMediaUrlRule;

describe('Barber lookup rate limit', function (): void {
    it('answers 429 once an account exhausts its budget, and only that account', function (): void {
        $first = BranchModel::factory()->create();
        $second = BranchModel::factory()->create();
        $this->authenticateDashboardActor($first);

        foreach (range(1, DashboardBarberLookupConstants::BARBER_LOOKUP_PER_ACCOUNT_PER_MINUTE) as $_) {
            $this->getJson('/api/v1/dashboard/barber-lookup?search=nobody@example.test')->assertOk();
        }
        $this->getJson('/api/v1/dashboard/barber-lookup?search=nobody@example.test')->assertTooManyRequests();

        $this->flushHeaders();
        $this->app['auth']->forgetGuards(); // the test app reuses guards between requests; production boots fresh per request
        $this->authenticateDashboardActor($second);
        $this->getJson('/api/v1/dashboard/barber-lookup?search=nobody@example.test')->assertOk();
    });
});

describe('Job board access (the admin is covered in DashboardAdminStaffingTest)', function (): void {
    it('refuses a barber on mark-seen', function (): void {
        $job = JobPostingModel::factory()->create();
        $this->authenticateDashboardActor(BarberModel::factory()->create());

        $this->postJson("/api/v1/dashboard/branches/{$job->branch_id}/job-postings/{$job->id}/applications/mark-seen")->assertForbidden();
    });

    it('marks only submitted applications of the manager\'s own posting, and repeats harmlessly', function (): void {
        $branch = BranchModel::factory()->create();
        $job = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
        $submitted = ApplicationModel::factory()->create(['job_posting_id' => $job->id]);
        $accepted = ApplicationModel::factory()->create(['job_posting_id' => $job->id, 'status' => ApplicationStatus::Accepted->value]);
        $otherJob = JobPostingModel::factory()->create(['branch_id' => $branch->id]);
        $other = ApplicationModel::factory()->create(['job_posting_id' => $otherJob->id]);
        $this->authenticateDashboardActor($branch);
        $path = "/api/v1/dashboard/branches/{$branch->id}/job-postings/{$job->id}/applications/mark-seen";

        $this->postJson($path)->assertOk()->assertJsonPath('data.updated', 1);
        $this->postJson($path)->assertOk()->assertJsonPath('data.updated', 0);

        expect($submitted->fresh()->status)->toBe(ApplicationStatus::Seen)
            ->and($accepted->fresh()->status)->toBe(ApplicationStatus::Accepted)
            ->and($other->fresh()->status)->toBe(ApplicationStatus::Submitted);
    });

    it('answers 404 for another shop\'s posting', function (): void {
        $foreign = JobPostingModel::factory()->create();
        $application = ApplicationModel::factory()->create(['job_posting_id' => $foreign->id]);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->postJson("/api/v1/dashboard/branches/{$foreign->branch_id}/job-postings/{$foreign->id}/applications/mark-seen")->assertNotFound();
        expect($application->fresh()->status)->toBe(ApplicationStatus::Submitted);
    });
});

describe('Website image references', function (): void {
    it('accepts site paths, trusted https hosts and empty values', function (?string $value): void {
        $section = SectionModel::factory()->for(MarketingPageModel::factory(), 'page')->create(['media_url' => null]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $payload = ['body' => ['en' => ['k' => 'v'], 'ar' => ['k' => 'v']], 'media_url' => $value];

        $this->putJson("/api/v1/dashboard/admin/marketing-sections/{$section->id}", $payload)->assertOk();
    })->with([
        'site path' => '/images/hero-neutral.jpg',
        'none' => null,
        'app host' => fn () => 'https://'.parse_url((string) config('app.url'), PHP_URL_HOST).'/images/a.png',
    ]);

    it('refuses scripts, data urls, protocol-relative, foreign hosts and traversal on a section', function (string $value): void {
        $section = SectionModel::factory()->for(MarketingPageModel::factory(), 'page')->create(['media_url' => null]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson("/api/v1/dashboard/admin/marketing-sections/{$section->id}", ['body' => ['en' => ['k' => 'v'], 'ar' => ['k' => 'v']], 'media_url' => $value])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('media_url');
        expect($section->fresh()->media_url)->toBeNull();
    })->with([
        'javascript' => 'javascript:alert(1)',
        'data' => 'data:text/html;base64,PHNjcmlwdD4=',
        'protocol relative' => '//evil.example/x.png',
        'foreign host' => 'https://evil.example/x.png',
        'plain http' => 'http://localhost/x.png',
        'userinfo' => 'https://localhost@evil.example/x.png',
        'traversal' => '/images/../../etc/passwd',
        'backslash' => '/\\evil.example',
    ]);

    it('refuses a foreign avatar on a testimonial', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson('/api/v1/dashboard/admin/testimonials', [
            'author_name' => 'Sara', 'body' => ['en' => 'Great', 'ar' => 'رائع'], 'rating' => 5, 'avatar_url' => 'javascript:alert(1)',
        ])->assertUnprocessable()->assertJsonValidationErrors('avatar_url');
    });

    it('lets an unchanged legacy value be saved again', function (): void {
        $section = SectionModel::factory()->for(MarketingPageModel::factory(), 'page')->create(['media_url' => 'https://old-cdn.example/x.png']);
        $testimonial = TestimonialModel::factory()->create(['avatar_url' => 'https://old-cdn.example/a.png']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson("/api/v1/dashboard/admin/marketing-sections/{$section->id}", ['body' => ['en' => ['k' => 'v'], 'ar' => ['k' => 'v']], 'media_url' => 'https://old-cdn.example/x.png'])->assertOk();
        $this->putJson("/api/v1/dashboard/admin/testimonials/{$testimonial->id}", [
            'author_name' => $testimonial->author_name, 'body' => ['en' => 'Great', 'ar' => 'رائع'], 'rating' => 5, 'avatar_url' => 'https://old-cdn.example/a.png',
        ])->assertOk();
    });

    it('accepts every seeded value', function (): void {
        $values = collect([...config('marketing.seed_sections'), ...config('marketing.seed_testimonials')])
            ->flatMap(fn (array $row): array => array_filter([$row['media_url'] ?? null, $row['avatar_url'] ?? null]));

        foreach ($values as $value) {
            $failed = false;
            (new TrustedMediaUrlRule)->validate('media_url', $value, function () use (&$failed): void {
                $failed = true;
            });
            expect($failed)->toBeFalse("seeded value {$value} must pass");
        }
    });
});
