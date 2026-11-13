<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Mail;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Exceptions\AccountBanException;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Exceptions\BarberActivationException;
use Modules\Barber\Exceptions\BarberRejectedException;
use Modules\Barber\Exceptions\BarberReviewException;
use Modules\Barber\Mail\BarberApproved;
use Modules\Barber\Mail\BarberRejected;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Models\NotificationModel;

const ADMIN_BARBERS_URL = '/api/v1/dashboard/admin/barbers';
const ADMIN_BARBERS_MISSING_ID = '00000000-0000-4000-8000-0000000000ee';

function barberWith(BarberStatusEnum $status, array $overrides = []): BarberModel
{
    return BarberModel::factory()->create(['status' => $status->value, ...$overrides]);
}

/** NS-30: the approval queue. */
describe('Barber approval queue (NS-30)', function (): void {
    it('lists the pending queue with login accounts only and honours status and search filters', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $pending = barberWith(BarberStatusEnum::Pending, ['email' => 'queue@example.com']);
        $branchCreated = barberWith(BarberStatusEnum::Pending, ['has_login' => false]);
        $rejected = barberWith(BarberStatusEnum::Rejected);
        $enabled = barberWith(BarberStatusEnum::Enabled);

        $ids = fn (string $query = ''): array => collect($this->getJson(ADMIN_BARBERS_URL.$query)->assertOk()->json('data'))->pluck('id')->all();

        expect($ids('?status=pending'))->toBe([$pending->id])
            ->and($ids('?status=rejected'))->toBe([$rejected->id])
            ->and($ids())->toContain($pending->id, $branchCreated->id, $rejected->id, $enabled->id)
            ->and($ids('?search=queue@'))->toBe([$pending->id]);
    });

    it('rejects an unknown status filter and treats wildcards literally', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        barberWith(BarberStatusEnum::Pending);

        $this->getJson(ADMIN_BARBERS_URL.'?status=ghost')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->getJson(ADMIN_BARBERS_URL.'?search=%25')->assertOk()->assertJsonCount(0, 'data');
    });

    it('shows one barber with the review fields and 404 for an unknown id', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Pending);

        $this->getJson(ADMIN_BARBERS_URL."/{$barber->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $barber->id)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.max_submissions', BarberReviewConstants::MAX_SUBMISSIONS)
            ->assertJsonPath('data.submission_count', 1);
        $this->getJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID)->assertNotFound();
    });

    it('approves a pending barber, writes an activation log, notifies and emails them', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Pending, ['rejection_reason' => 'Old reason.']);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'enabled');

        expect($barber->fresh())->status->toBe(BarberStatusEnum::Enabled)->rejection_reason->toBeNull()->reviewed_at->not->toBeNull()
            ->and(ActivationLogModel::query()->where('activable_id', $barber->id)->count())->toBe(1)
            ->and(NotificationModel::query()->where('notifiable_id', $barber->id)->count())->toBe(1);
        Mail::assertQueued(BarberApproved::class);
    });

    it('rejects a pending barber with a trimmed reason and emails the reason', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Pending);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/reject", ['reason' => '  Photos are unclear.  '])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Photos are unclear.');

        expect($barber->fresh())->status->toBe(BarberStatusEnum::Rejected)->reviewed_at->not->toBeNull()
            ->and(ActivationLogModel::query()->where('activable_id', $barber->id)->count())->toBe(0);
        Mail::assertQueued(BarberRejected::class);
    });

    it('validates the rejection reason', function (array $payload): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Pending);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/reject", $payload)->assertUnprocessable()->assertJsonValidationErrors('reason');

        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Pending);
    })->with([
        'missing' => [[]],
        'short' => [['reason' => 'ab']],
        'long' => [['reason' => str_repeat('a', BarberReviewConstants::REASON_MAX_LENGTH + 1)]],
    ]);

    it('answers 409 barber_not_pending when approving or rejecting anyone not pending', function (BarberStatusEnum $status): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith($status);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/approve")->assertStatus(409)->assertJsonPath('code', BarberReviewException::CODE_NOT_PENDING);
        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/reject", ['reason' => 'Valid reason.'])->assertStatus(409);

        expect($barber->fresh()->status)->toBe($status);
        Mail::assertNothingOutgoing();
    })->with([BarberStatusEnum::Enabled, BarberStatusEnum::Disabled, BarberStatusEnum::Rejected]);

    it('answers 404 for an unknown barber on approve and reject', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID.'/approve')->assertNotFound();
        $this->patchJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID.'/reject', ['reason' => 'Valid reason.'])->assertNotFound();
    });
});

/** The rejected barber's way back (NS-30, stylist app contract). */
describe('Rejected barber login and resubmission (NS-30)', function (): void {
    it('refuses a rejected barber at login with ACCOUNT_REJECTED and the reason', function (): void {
        barberWith(BarberStatusEnum::Rejected, ['email' => 'rej@example.com', 'rejection_reason' => 'Photos are unclear.']);

        $this->postJson('/api/v1/barber/login', ['email' => 'rej@example.com', 'password' => 'password'])
            ->assertForbidden()
            ->assertJsonPath('code', BarberRejectedException::CODE)
            ->assertJsonPath('message', fn (string $message): bool => str_contains($message, 'Photos are unclear.'));
    });

    it('returns the barber to pending, counts the submission, applies fixes and alerts the admins', function (): void {
        $admin = AdminModel::factory()->create();
        $barber = barberWith(BarberStatusEnum::Rejected, ['email' => 'rej@example.com', 'rejection_reason' => 'Fix bio.']);

        $this->postJson('/api/v1/barber/resubmit', [
            'email' => 'rej@example.com',
            'password' => 'password',
            'bio' => ['en' => 'Fixed bio.', 'ar' => 'نبذة'],
        ])->assertOk();

        expect($barber->fresh())->status->toBe(BarberStatusEnum::Pending)->submission_count->toBe(2)
            ->and($barber->fresh()->getTranslation('bio', 'en'))->toBe('Fixed bio.')
            ->and(NotificationModel::query()->where('notifiable_id', $admin->id)->count())->toBe(1);
    });

    it('stops at the third submission with barber_resubmission_limit', function (): void {
        $barber = barberWith(BarberStatusEnum::Rejected, ['email' => 'rej@example.com', 'submission_count' => BarberReviewConstants::MAX_SUBMISSIONS]);

        $this->postJson('/api/v1/barber/resubmit', ['email' => 'rej@example.com', 'password' => 'password'])
            ->assertStatus(409)
            ->assertJsonPath('code', BarberReviewException::CODE_RESUBMISSION_LIMIT);

        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Rejected);
    });

    it('answers 409 when the barber is not rejected and 401 on a wrong password or unknown email', function (): void {
        barberWith(BarberStatusEnum::Pending, ['email' => 'pend@example.com']);
        barberWith(BarberStatusEnum::Rejected, ['email' => 'rej@example.com']);

        $this->postJson('/api/v1/barber/resubmit', ['email' => 'pend@example.com', 'password' => 'password'])
            ->assertStatus(409)->assertJsonPath('code', BarberReviewException::CODE_NOT_REJECTED);
        $this->postJson('/api/v1/barber/resubmit', ['email' => 'rej@example.com', 'password' => 'wrong-password'])->assertUnauthorized();
        $this->postJson('/api/v1/barber/resubmit', ['email' => 'nobody@example.com', 'password' => 'password'])->assertUnauthorized();
    });

    it('refuses a banned barber with ACCOUNT_BANNED and a taken phone with 422', function (): void {
        $banned = barberWith(BarberStatusEnum::Rejected, ['email' => 'ban@example.com']);
        $banned->bans()->create(['reason' => 'Fraud.', 'banned_at' => now()->subMinute()]);
        $other = barberWith(BarberStatusEnum::Rejected, ['email' => 'other@example.com']);
        barberWith(BarberStatusEnum::Enabled, ['phone' => '+962790000001']);

        $this->postJson('/api/v1/barber/resubmit', ['email' => 'ban@example.com', 'password' => 'password'])
            ->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
        $this->postJson('/api/v1/barber/resubmit', ['email' => 'other@example.com', 'password' => 'password', 'phone' => '+962790000001'])
            ->assertUnprocessable()->assertJsonValidationErrors('phone');

        expect($other->fresh()->status)->toBe(BarberStatusEnum::Rejected);
    });
});

/** NS-08: activation, bans, log and affiliations of an approved barber. */
describe('Barber activation (NS-08)', function (): void {
    it('deactivates an enabled barber and logs the admin and reason, then reactivates', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $barber = barberWith(BarberStatusEnum::Enabled);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/deactivate", ['reason' => 'Complaints.'])
            ->assertOk()->assertJsonPath('data.status', 'disabled');
        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Disabled);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/activate")->assertOk()->assertJsonPath('data.status', 'enabled');

        $logs = ActivationLogModel::query()->where('activable_type', ActivableTypeEnum::Barber)->where('activable_id', $barber->id)->orderBy('activated_at')->get();
        expect($logs)->toHaveCount(2)
            ->and($logs[0])->status->toBe(ActivationStatusEnum::Disabled)->reason->toBe('Complaints.')->activated_by_id->toBe($admin->id)
            ->and($logs[1])->status->toBe(ActivationStatusEnum::Enabled)->reason->toBeNull();
    });

    it('answers 409 for a repeated move and for pending or rejected barbers', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $enabled = barberWith(BarberStatusEnum::Enabled);
        $disabled = barberWith(BarberStatusEnum::Disabled);
        $pending = barberWith(BarberStatusEnum::Pending);
        $rejected = barberWith(BarberStatusEnum::Rejected);

        $this->patchJson(ADMIN_BARBERS_URL."/{$enabled->id}/activate")->assertStatus(409)->assertJsonPath('code', BarberActivationException::CODE_NOT_DISABLED);
        $this->patchJson(ADMIN_BARBERS_URL."/{$disabled->id}/deactivate")->assertStatus(409)->assertJsonPath('code', BarberActivationException::CODE_NOT_ENABLED);
        foreach ([$pending, $rejected] as $barber) {
            $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/activate")->assertStatus(409);
            $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/deactivate")->assertStatus(409);
        }

        expect($pending->fresh()->status)->toBe(BarberStatusEnum::Pending)
            ->and($rejected->fresh()->status)->toBe(BarberStatusEnum::Rejected)
            ->and(ActivationLogModel::query()->count())->toBe(0);
    });

    it('validates the optional reason length and answers 404 for an unknown barber', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Enabled);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/deactivate", ['reason' => 'x'])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->patchJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID.'/deactivate')->assertNotFound();
        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Enabled);
    });

    it('lists the activation log newest first, only for that barber', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Enabled);
        $other = barberWith(BarberStatusEnum::Enabled);
        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/deactivate", ['reason' => 'First.'])->assertOk();
        $this->travel(1)->minute();
        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/activate", ['reason' => 'Second.'])->assertOk();
        $this->patchJson(ADMIN_BARBERS_URL."/{$other->id}/deactivate")->assertOk();

        $this->getJson(ADMIN_BARBERS_URL."/{$barber->id}/activation-log")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.reason', 'Second.')
            ->assertJsonPath('data.1.reason', 'First.');
        $this->getJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID.'/activation-log')->assertNotFound();
    });

    it('lists the barber affiliations newest first, only that barber', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Enabled);
        $branch = BranchModel::factory()->create();
        $mine = BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $branch->id, 'affiliable_type' => 'branch']);
        BarberAffiliationModel::factory()->create();

        $this->getJson(ADMIN_BARBERS_URL."/{$barber->id}/affiliations")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);
        $this->getJson(ADMIN_BARBERS_URL.'/'.ADMIN_BARBERS_MISSING_ID.'/affiliations')->assertNotFound();
    });
});

describe('Barber bans (NS-08)', function (): void {
    it('bans with a reason, signs the barber out and shows the ban in the list', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $barber = barberWith(BarberStatusEnum::Enabled);
        $barber->createToken('stylist-app');

        $this->postJson(ADMIN_BARBERS_URL."/{$barber->id}/ban", ['reason' => 'Harassment.'])
            ->assertOk()
            ->assertJsonPath('data.is_banned', true)
            ->assertJsonPath('data.bans.0.reason', 'Harassment.');

        expect($barber->tokens()->count())->toBe(0)->and($barber->fresh()->isBanned())->toBeTrue();
        $row = collect($this->getJson(ADMIN_BARBERS_URL)->assertOk()->json('data'))->firstWhere('id', $barber->id);
        expect($row['is_banned'])->toBeTrue();
    });

    it('answers 409 for a double ban or an unban without a ban, and 422 without a reason', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $barber = barberWith(BarberStatusEnum::Enabled);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/unban")->assertStatus(409)->assertJsonPath('code', AccountBanException::CODE_NOT_BANNED);
        $this->postJson(ADMIN_BARBERS_URL."/{$barber->id}/ban", [])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->postJson(ADMIN_BARBERS_URL."/{$barber->id}/ban", ['reason' => 'Valid reason.'])->assertOk();
        $this->postJson(ADMIN_BARBERS_URL."/{$barber->id}/ban", ['reason' => 'Valid reason.'])->assertStatus(409)->assertJsonPath('code', AccountBanException::CODE_ALREADY_BANNED);
    });

    it('unbans and keeps the ban row with who lifted it', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $barber = barberWith(BarberStatusEnum::Enabled);
        $barber->bans()->create(['reason' => 'Harassment.', 'banned_at' => now()->subMinute()]);

        $this->patchJson(ADMIN_BARBERS_URL."/{$barber->id}/unban")->assertOk()->assertJsonPath('data.is_banned', false);

        expect($barber->bans()->firstOrFail())->lifted_by_id->toBe($admin->id)->lifted_at->not->toBeNull();
    });
});

describe('Barber admin routes are platform-admin only', function (): void {
    it('rejects anonymous callers, owners, managers and barbers without changing anything', function (string $method, string $path): void {
        $barber = barberWith(BarberStatusEnum::Pending);
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $url = ADMIN_BARBERS_URL.'/'.str_replace('{id}', $barber->id, $path);

        $this->json($method, $url, ['reason' => 'Valid reason.'])->assertUnauthorized();

        foreach ([$owner, BranchModel::factory()->create(), BarberModel::factory()->create()] as $actor) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            $this->json($method, $url, ['reason' => 'Valid reason.'])->assertForbidden();
        }

        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Pending);
    })->with([
        ['GET', ''], ['GET', '{id}'], ['PATCH', '{id}/approve'], ['PATCH', '{id}/reject'],
        ['PATCH', '{id}/activate'], ['PATCH', '{id}/deactivate'], ['POST', '{id}/ban'], ['PATCH', '{id}/unban'],
        ['GET', '{id}/activation-log'], ['GET', '{id}/affiliations'],
    ]);
});
