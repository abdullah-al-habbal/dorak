<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Enums\FeedbackStatusEnum;
use Modules\Feedback\Models\FeedbackReportModel;

const FEEDBACK_URL = '/api/v1/feedback';
const FEEDBACK_ADMIN_URL = '/api/v1/dashboard/admin/feedback';

function feedbackPayload(array $overrides = []): array
{
    return array_merge([
        'kind' => 'bug',
        'message' => 'The confirm button does nothing.',
        'contact_email' => 'sam@example.com',
        'app' => 'client',
        'platform' => 'android',
        'app_version' => '1.4.2+17',
        'locale' => 'en',
        'screen' => 'booking/confirm',
        'workflow' => 'create_booking',
    ], $overrides);
}

describe('POST /api/v1/feedback', function (): void {
    it('stores a guest report with its source context and no user', function (): void {
        $this->postJson(FEEDBACK_URL, feedbackPayload(['related_type' => 'booking', 'related_id' => fake()->uuid()]))->assertCreated();

        $report = FeedbackReportModel::query()->firstOrFail();
        expect($report->status)->toBe(FeedbackStatusEnum::New)
            ->and($report->app->value)->toBe('client')
            ->and($report->platform->value)->toBe('android')
            ->and($report->app_version)->toBe('1.4.2+17')
            ->and($report->screen)->toBe('booking/confirm')
            ->and($report->workflow)->toBe('create_booking')
            ->and($report->related_type->value)->toBe('booking')
            ->and($report->user_type)->toBeNull()
            ->and($report->user_id)->toBeNull();
    });

    it('attributes a signed-in sender from the token and ignores a user claimed in the body', function (string $guard): void {
        $account = match ($guard) {
            'client' => ClientModel::factory()->create(),
            'barber' => BarberModel::factory()->create(),
            'branch' => BranchModel::factory()->create(),
        };
        $token = $account->createToken('app', ['*'])->plainTextToken;

        $this->withToken($token)->postJson(FEEDBACK_URL, feedbackPayload(['contact_email' => null, 'user_type' => 'barber', 'user_id' => fake()->uuid()]))->assertCreated();

        $report = FeedbackReportModel::query()->firstOrFail();
        expect($report->user_type->value)->toBe($guard)->and($report->user_id)->toBe((string) $account->getKey());
    })->with(['client', 'barber', 'branch']);

    it('treats an invalid token as a guest', function (): void {
        $this->withToken('not-a-real-token')->postJson(FEEDBACK_URL, feedbackPayload())->assertCreated();

        expect(FeedbackReportModel::query()->firstOrFail()->user_id)->toBeNull();
    });

    it('requires an email from a guest but not from a signed-in sender', function (): void {
        $this->postJson(FEEDBACK_URL, feedbackPayload(['contact_email' => null]))->assertUnprocessable()->assertJsonValidationErrors('contact_email');

        $token = ClientModel::factory()->create()->createToken('app', ['*'])->plainTextToken;
        $this->withToken($token)->postJson(FEEDBACK_URL, feedbackPayload(['contact_email' => null]))->assertCreated();
    });

    it('validates the fields', function (array $overrides, string $field): void {
        $this->postJson(FEEDBACK_URL, feedbackPayload($overrides))->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(FeedbackReportModel::query()->count())->toBe(0);
    })->with([
        'unknown kind' => [['kind' => 'rant'], 'kind'],
        'short message' => [['message' => 'no'], 'message'],
        'long message' => [fn () => ['message' => str_repeat('a', 2001)], 'message'],
        'unknown app' => [['app' => 'toaster'], 'app'],
        'unknown platform' => [['platform' => 'beos'], 'platform'],
        'bad email' => [['contact_email' => 'nope'], 'contact_email'],
        'bad version' => [['app_version' => '<script>'], 'app_version'],
        'markup in a screen' => [['screen' => '<img src=x>'], 'screen'],
        'unsupported locale' => [['locale' => 'fr'], 'locale'],
        'related id without a type' => [['related_id' => 'abc'], 'related_type'],
        'unknown related type' => [['related_type' => 'invoice', 'related_id' => 'abc'], 'related_type'],
        'markup in a related id' => [['related_type' => 'booking', 'related_id' => '<b>'], 'related_id'],
    ]);

    it('answers success but stores nothing when the honeypot is filled', function (): void {
        $this->postJson(FEEDBACK_URL, feedbackPayload([FeedbackConstants::FEEDBACK_HONEYPOT_FIELD => 'https://spam.example']))->assertCreated();

        expect(FeedbackReportModel::query()->count())->toBe(0);
    });

    it('limits a sender to five reports a minute', function (): void {
        foreach (range(1, 5) as $_) {
            $this->postJson(FEEDBACK_URL, feedbackPayload())->assertCreated();
        }

        $this->postJson(FEEDBACK_URL, feedbackPayload())->assertTooManyRequests();
        expect(FeedbackReportModel::query()->count())->toBe(5);
    });

    it('limits a sender to a daily budget even when the minute window resets', function (): void {
        foreach (range(1, FeedbackConstants::FEEDBACK_SUBMIT_PER_DAY) as $_) {
            $this->travel(61)->seconds();
            $this->postJson(FEEDBACK_URL, feedbackPayload())->assertCreated();
        }

        $this->travel(61)->seconds();
        $this->postJson(FEEDBACK_URL, feedbackPayload())->assertTooManyRequests();
    });

    it('stores markup as plain text and the admin resource returns it unchanged for the client to escape', function (): void {
        $this->postJson(FEEDBACK_URL, feedbackPayload(['message' => '<script>alert(1)</script> broken']))->assertCreated();

        expect(FeedbackReportModel::query()->firstOrFail()->message)->toBe('<script>alert(1)</script> broken');
    });
});

describe('Admin feedback management', function (): void {
    it('lists newest first with filters, and the source apart from the related record', function (): void {
        FeedbackReportModel::factory()->create(['message' => 'old crash', 'created_at' => now()->subDay()]);
        FeedbackReportModel::factory()->create(['message' => 'new idea', 'kind' => 'suggestion', 'app' => 'stylist', 'platform' => 'ios', 'related_type' => 'branch', 'related_id' => 'b-1']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $all = $this->getJson(FEEDBACK_ADMIN_URL)->assertOk();
        expect(collect($all->json('data'))->pluck('message')->all())->toBe(['new idea', 'old crash'])
            ->and($all->json('data.0.source.app'))->toBe('stylist')
            ->and($all->json('data.0.source.platform'))->toBe('ios')
            ->and($all->json('data.0.related'))->toBe(['type' => 'branch', 'id' => 'b-1'])
            ->and($all->json('data.1.related'))->toBeNull();

        expect($this->getJson(FEEDBACK_ADMIN_URL.'?kind=suggestion')->json('data'))->toHaveCount(1)
            ->and($this->getJson(FEEDBACK_ADMIN_URL.'?app=client&platform=android')->json('data.0.message'))->toBe('old crash')
            ->and($this->getJson(FEEDBACK_ADMIN_URL.'?search=idea')->json('data'))->toHaveCount(1)
            ->and($this->getJson(FEEDBACK_ADMIN_URL.'?status=resolved')->json('data'))->toHaveCount(0);
        $this->getJson(FEEDBACK_ADMIN_URL.'?kind=nope')->assertUnprocessable();
    });

    it('treats a search with wildcard characters literally', function (): void {
        FeedbackReportModel::factory()->create(['message' => '100% broken']);
        FeedbackReportModel::factory()->create(['message' => 'fine']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        expect($this->getJson(FEEDBACK_ADMIN_URL.'?search=%25')->json('data'))->toHaveCount(1);
    });

    it('shows one report', function (): void {
        $report = FeedbackReportModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(FEEDBACK_ADMIN_URL."/{$report->id}")->assertOk()->assertJsonPath('data.id', $report->id);
        $this->getJson(FEEDBACK_ADMIN_URL.'/'.fake()->uuid())->assertNotFound();
    });

    it('changes the status and note, logs a real change, and logs nothing for a note-only edit', function (): void {
        $report = FeedbackReportModel::factory()->create();
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);

        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'triaged', 'admin_note' => '  Looks real. '])
            ->assertOk()->assertJsonPath('data.status', 'triaged')->assertJsonPath('data.admin_note', 'Looks real.');
        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'triaged', 'admin_note' => 'Looks real, repro on iOS.'])->assertOk();

        $logs = StatusChangeLogModel::query()->where('subject_id', $report->id)->get();
        expect($logs)->toHaveCount(1)
            ->and($logs->first()->from_status)->toBe('new')->and($logs->first()->to_status)->toBe('triaged')
            ->and($logs->first()->actor_id)->toBe((string) $admin->getKey())
            ->and($report->fresh()->admin_note)->toBe('Looks real, repro on iOS.');
    });

    it('never edits what the sender wrote and validates the status', function (): void {
        $report = FeedbackReportModel::factory()->create(['message' => 'original message']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'resolved', 'message' => 'rewritten', 'contact_email' => 'x@y.z'])->assertOk();
        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'bogus'])->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", [])->assertUnprocessable();

        expect($report->fresh()->message)->toBe('original message');
    });

    it('refuses anonymous callers and every non-admin account', function (): void {
        $report = FeedbackReportModel::factory()->create();

        $this->getJson(FEEDBACK_ADMIN_URL)->assertUnauthorized();
        $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'closed'])->assertUnauthorized();

        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create()] as $account) {
            $this->authenticateDashboardActor($account);
            $this->getJson(FEEDBACK_ADMIN_URL)->assertForbidden();
            $this->getJson(FEEDBACK_ADMIN_URL."/{$report->id}")->assertForbidden();
            $this->patchJson(FEEDBACK_ADMIN_URL."/{$report->id}", ['status' => 'closed'])->assertForbidden();
        }
        expect($report->fresh()->status)->toBe(FeedbackStatusEnum::New);
    });
});
