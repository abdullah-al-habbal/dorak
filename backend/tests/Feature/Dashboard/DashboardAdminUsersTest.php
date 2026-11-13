<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Mail;
use Modules\Admin\Exceptions\AdminUserGuardException;
use Modules\Admin\Models\AdminModel;
use Modules\Admin\Services\AdminUserService;
use Modules\Dashboard\Mail\SendDashboardPasswordResetLink;

const ADMIN_USERS_URL = '/api/v1/dashboard/admin/admins';
const ADMIN_USERS_MISSING_ID = '00000000-0000-4000-8000-0000000000aa';

/** @return array{name: array{en: string, ar: string}, email: string} */
function adminUserPayload(string $email = 'New.Colleague@Example.com'): array
{
    return ['name' => ['en' => 'New Colleague', 'ar' => 'زميل جديد'], 'email' => $email];
}

/** NS-04: invite, edit, deactivate, reactivate and resend for platform admins. */
describe('Invite an admin', function (): void {
    it('creates the account, lowercases the email and mails a password-setting link', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $response = $this->postJson(ADMIN_USERS_URL, adminUserPayload())->assertCreated();

        $response->assertJsonPath('data.email', 'new.colleague@example.com')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonMissingPath('data.password');
        $created = AdminModel::query()->where('email', 'new.colleague@example.com')->firstOrFail();
        expect($created->deactivated_at)->toBeNull()
            ->and($created->password)->not->toBeEmpty();
        Mail::assertSent(SendDashboardPasswordResetLink::class, 1);
    });

    it('rejects a duplicate email with 422 and sends nothing', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        AdminModel::factory()->create(['email' => 'taken@example.com']);

        $this->postJson(ADMIN_USERS_URL, adminUserPayload('taken@example.com'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        Mail::assertNothingSent();
    });

    it('rejects a missing name, a missing arabic name and a bad email', function (array $payload, string $field): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(ADMIN_USERS_URL, $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
    })->with([
        'no name' => [['email' => 'a@example.com'], 'name'],
        'no arabic name' => [['name' => ['en' => 'Only English'], 'email' => 'a@example.com'], 'name.ar'],
        'bad email' => [['name' => ['en' => 'A', 'ar' => 'أ'], 'email' => 'not-an-email'], 'email'],
        'no email' => [['name' => ['en' => 'A', 'ar' => 'أ']], 'email'],
    ]);
});

describe('Edit an admin', function (): void {
    it('updates name and email', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $target = AdminModel::factory()->create();

        $this->putJson(ADMIN_USERS_URL.'/'.$target->id, adminUserPayload('Renamed@Example.com'))
            ->assertOk()
            ->assertJsonPath('data.email', 'renamed@example.com');

        expect($target->fresh()->email)->toBe('renamed@example.com')
            ->and($target->fresh()->getTranslation('name', 'en'))->toBe('New Colleague');
    });

    it('lets an admin keep their own email on edit but not take another admin email', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $target = AdminModel::factory()->create(['email' => 'keep@example.com']);
        AdminModel::factory()->create(['email' => 'other@example.com']);

        $this->putJson(ADMIN_USERS_URL.'/'.$target->id, adminUserPayload('keep@example.com'))->assertOk();
        $this->putJson(ADMIN_USERS_URL.'/'.$target->id, adminUserPayload('other@example.com'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    });

    it('returns 404 for an unknown admin', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->putJson(ADMIN_USERS_URL.'/'.ADMIN_USERS_MISSING_ID, adminUserPayload())->assertNotFound();
    });
});

describe('Deactivate and reactivate an admin', function (): void {
    it('refuses self-deactivation with a stable 409 code', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);

        $this->patchJson(ADMIN_USERS_URL."/{$admin->id}/deactivate")
            ->assertStatus(409)
            ->assertJsonPath('code', AdminUserGuardException::CODE_SELF_DEACTIVATION);

        expect($admin->fresh()->deactivated_at)->toBeNull();
    });

    it('refuses to deactivate the last active admin', function (): void {
        $service = app(AdminUserService::class);
        $onlyActive = AdminModel::factory()->create();
        $acting = AdminModel::factory()->create(['deactivated_at' => now()]);

        expect(fn () => $service->deactivate((string) $onlyActive->id, (string) $acting->id))
            ->toThrow(AdminUserGuardException::class);
        expect($onlyActive->fresh()->deactivated_at)->toBeNull();
    });

    it('reports the last-active guard as a stable 409 code', function (): void {
        $onlyActive = AdminModel::factory()->create();
        $acting = AdminModel::factory()->create(['deactivated_at' => now()]);

        try {
            app(AdminUserService::class)->deactivate((string) $onlyActive->id, (string) $acting->id);
        } catch (AdminUserGuardException $exception) {
            $this->assertSame(409, $exception->render()->getStatusCode());
            $this->assertSame(AdminUserGuardException::CODE_LAST_ACTIVE, $exception->render()->getData(true)['code']);

            return;
        }
        $this->fail('The last active admin was deactivated.');
    });

    it('deactivates another admin, stamps the time and deletes their tokens', function (): void {
        $actor = AdminModel::factory()->create();
        $target = AdminModel::factory()->create();
        $target->createToken('dashboard-session', ['dashboard']);
        $this->authenticateDashboardActor($actor);

        $this->patchJson(ADMIN_USERS_URL."/{$target->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        expect($target->fresh()->deactivated_at)->not->toBeNull()
            ->and($target->tokens()->count())->toBe(0);
    });

    it('keeps the original timestamp when deactivating twice', function (): void {
        $actor = AdminModel::factory()->create();
        $target = AdminModel::factory()->create(['deactivated_at' => now()->subDay()]);
        $original = $target->deactivated_at;
        $this->authenticateDashboardActor($actor);

        $this->patchJson(ADMIN_USERS_URL."/{$target->id}/deactivate")->assertOk();

        expect($target->fresh()->deactivated_at->equalTo($original))->toBeTrue();
    });

    it('reactivates a deactivated admin', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $target = AdminModel::factory()->create(['deactivated_at' => now()]);

        $this->patchJson(ADMIN_USERS_URL."/{$target->id}/reactivate")
            ->assertOk()
            ->assertJsonPath('data.is_active', true);

        expect($target->fresh()->deactivated_at)->toBeNull();
    });

    it('returns 404 for an unknown admin on both transitions', function (string $action): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(ADMIN_USERS_URL.'/'.ADMIN_USERS_MISSING_ID."/{$action}")->assertNotFound();
    })->with(['deactivate', 'reactivate']);

    it('rejects a deactivated admin token on the next request', function (): void {
        $actor = AdminModel::factory()->create();
        $target = AdminModel::factory()->create();
        $this->authenticateDashboardActor($actor);
        $this->patchJson(ADMIN_USERS_URL."/{$target->id}/deactivate")->assertOk();

        $this->flushHeaders();
        app('auth')->forgetGuards();
        $this->authenticateDashboardActor($target->fresh());

        $this->getJson(ADMIN_USERS_URL)->assertUnauthorized();
    });
});

describe('Resend an invitation', function (): void {
    it('mails a new link to an active admin', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $target = AdminModel::factory()->create();

        $this->postJson(ADMIN_USERS_URL."/{$target->id}/resend-invite")->assertOk();

        Mail::assertSent(SendDashboardPasswordResetLink::class, 1);
    });

    it('answers 422 and sends nothing while the previous link is still throttled', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->postJson(ADMIN_USERS_URL, adminUserPayload('invitee@example.com'))->assertCreated();
        $invitee = AdminModel::query()->where('email', 'invitee@example.com')->firstOrFail();

        $this->postJson(ADMIN_USERS_URL."/{$invitee->id}/resend-invite")->assertUnprocessable();

        Mail::assertSent(SendDashboardPasswordResetLink::class, 1);
    });

    it('returns 404 for a deactivated or unknown admin and sends nothing', function (): void {
        Mail::fake();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $deactivated = AdminModel::factory()->create(['deactivated_at' => now()]);

        $this->postJson(ADMIN_USERS_URL."/{$deactivated->id}/resend-invite")->assertNotFound();
        $this->postJson(ADMIN_USERS_URL.'/'.ADMIN_USERS_MISSING_ID.'/resend-invite')->assertNotFound();

        Mail::assertNothingSent();
    });
});

describe('List admins', function (): void {
    it('filters by status and search, and lists deactivated admins last', function (): void {
        $actor = AdminModel::factory()->create(['email' => 'actor@example.com']);
        AdminModel::factory()->create(['email' => 'zed@example.com', 'deactivated_at' => now()]);
        AdminModel::factory()->create(['email' => 'findme@example.com']);
        $this->authenticateDashboardActor($actor);

        $all = $this->getJson(ADMIN_USERS_URL)->assertOk()->json('data');
        expect(collect($all)->last()['email'])->toBe('zed@example.com');

        $active = $this->getJson(ADMIN_USERS_URL.'?active=1')->assertOk()->json('data');
        expect(collect($active)->every(fn (array $row): bool => $row['is_active']))->toBeTrue();

        $inactive = $this->getJson(ADMIN_USERS_URL.'?active=0')->assertOk()->json('data');
        expect($inactive)->toHaveCount(1);

        $found = $this->getJson(ADMIN_USERS_URL.'?search=findme')->assertOk()->json('data');
        expect($found)->toHaveCount(1)->and($found[0]['email'])->toBe('findme@example.com');
    });

    it('treats LIKE wildcards in the search as literal text', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create(['email' => 'actor@example.com']));

        $this->getJson(ADMIN_USERS_URL.'?search=%25')->assertOk()->assertJsonCount(0, 'data');
    });
});
