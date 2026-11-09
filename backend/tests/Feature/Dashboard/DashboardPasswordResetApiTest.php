<?php

declare(strict_types=1);

use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Defer\DeferredCallbackCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Enums\Locale;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\CQRS\Command\ForgotDashboardPasswordCommand;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Handlers\Password\ForgotDashboardPasswordHandler;
use Modules\Dashboard\Mail\SendDashboardPasswordResetLink;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

const RESET_NEW_PASSWORD = 'a-brand-new-password-123';

/** Creates a dashboard-eligible account of each type, signed in with `password`. */
function passwordResetAccount(DashboardActorTypeEnum $type, string $email): AdminModel|BranchModel|BarberModel|ClientModel
{
    $attributes = ['email' => $email, 'password' => Hash::make('password')];

    return match ($type) {
        DashboardActorTypeEnum::Admin => AdminModel::factory()->create($attributes),
        DashboardActorTypeEnum::Branch => BranchModel::factory()->create($attributes),
        DashboardActorTypeEnum::Barber => BarberModel::factory()->create([...$attributes, 'has_login' => true, 'status' => BarberStatusEnum::Enabled]),
        DashboardActorTypeEnum::Owner => tap(ClientModel::factory()->create($attributes), function (ClientModel $client): void {
            BrandModel::factory()->create(['owner_id' => $client->id]);
        }),
    };
}

/** Requests a link and returns the plain token read from the mailed URL. */
function passwordResetRequestToken(mixed $test, DashboardActorTypeEnum $type, string $email): string
{
    $test->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => $type->value, 'email' => $email])->assertOk();
    $token = '';
    Mail::assertSent(SendDashboardPasswordResetLink::class, function (SendDashboardPasswordResetLink $mail) use (&$token): bool {
        parse_str((string) parse_url($mail->url, PHP_URL_QUERY), $query);
        $token = (string) ($query['token'] ?? '');

        return true;
    });

    return $token;
}

function passwordResetSubmit(mixed $test, DashboardActorTypeEnum $type, string $email, string $token): mixed
{
    return $test->postJson('/api/v1/dashboard/password/reset', [
        'actor_type' => $type->value,
        'email' => $email,
        'token' => $token,
        'password' => RESET_NEW_PASSWORD,
        'password_confirmation' => RESET_NEW_PASSWORD,
    ]);
}

dataset('dashboard account types', [
    'admin' => [DashboardActorTypeEnum::Admin],
    'manager' => [DashboardActorTypeEnum::Branch],
    'barber' => [DashboardActorTypeEnum::Barber],
    'owner' => [DashboardActorTypeEnum::Owner],
]);

describe('Dashboard password recovery', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
        config(['dashboard.dashboard.frontend_url' => 'https://dashboard.example.test']);
    });

    it('mails a link to the account portal and stores only a hash of the token', function (DashboardActorTypeEnum $type): void {
        $account = passwordResetAccount($type, 'reset@example.test');

        $token = passwordResetRequestToken($this, $type, 'reset@example.test');

        Mail::assertSent(SendDashboardPasswordResetLink::class, fn (SendDashboardPasswordResetLink $mail): bool => $mail->hasTo('reset@example.test')
            && str_starts_with($mail->url, 'https://dashboard.example.test/dashboard/'.$type->portalSegment().'/reset-password?'));
        $stored = DB::table('password_reset_tokens_'.$type->passwordBroker()->value)->where('email', $account->email)->value('token');
        expect($token)->toHaveLength(64)
            ->and($stored)->not->toBe($token)
            ->and(Hash::check($token, (string) $stored))->toBeTrue();
    })->with('dashboard account types');

    it('builds manager links with the manager segment, not the backend actor type', function (): void {
        passwordResetAccount(DashboardActorTypeEnum::Branch, 'manager@example.test');

        passwordResetRequestToken($this, DashboardActorTypeEnum::Branch, 'manager@example.test');

        Mail::assertSent(SendDashboardPasswordResetLink::class, fn (SendDashboardPasswordResetLink $mail): bool => str_contains($mail->url, '/dashboard/manager/reset-password')
            && ! str_contains($mail->url, '/dashboard/branch/'));
    });

    it('answers an unknown email exactly like a known one and mails nothing', function (DashboardActorTypeEnum $type): void {
        passwordResetAccount($type, 'known@example.test');

        $known = $this->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => $type->value, 'email' => 'known@example.test'])->assertOk();
        $unknown = $this->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => $type->value, 'email' => 'nobody@example.test'])->assertOk();

        expect($unknown->json('message'))->toBe($known->json('message'))
            ->and($unknown->json('data'))->toBe($known->json('data'));
        Mail::assertSentCount(1);
    })->with('dashboard account types');

    it('never uses the default reset notification', function (): void {
        Notification::fake();
        passwordResetAccount(DashboardActorTypeEnum::Admin, 'admin@example.test');

        passwordResetRequestToken($this, DashboardActorTypeEnum::Admin, 'admin@example.test');

        Notification::assertNothingSent();
    });

    it('keeps the same answer while the broker throttle holds a recent link', function (): void {
        passwordResetAccount(DashboardActorTypeEnum::Branch, 'twice@example.test');
        $payload = ['actor_type' => 'branch', 'email' => 'twice@example.test'];

        $first = $this->postJson('/api/v1/dashboard/password/forgot', $payload)->assertOk();
        $second = $this->postJson('/api/v1/dashboard/password/forgot', $payload)->assertOk();

        expect($second->json('message'))->toBe($first->json('message'));
        Mail::assertSentCount(1);
    });

    it('sends nothing to a client without a brand or a barber without a login', function (): void {
        ClientModel::factory()->create(['email' => 'client@example.test']);
        BarberModel::factory()->create(['email' => 'stylist@example.test', 'has_login' => false, 'status' => BarberStatusEnum::Enabled]);

        $this->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => 'owner', 'email' => 'client@example.test'])->assertOk();
        $this->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => 'barber', 'email' => 'stylist@example.test'])->assertOk();

        Mail::assertNothingSent();
    });

    it('mails only after the response, never during the request', function (): void {
        passwordResetAccount(DashboardActorTypeEnum::Admin, 'deferred@example.test');

        app(ForgotDashboardPasswordHandler::class)->handle(new ForgotDashboardPasswordCommand(DashboardActorTypeEnum::Admin, 'deferred@example.test', 'en'));
        Mail::assertNothingSent();

        app(DeferredCallbackCollection::class)->invoke();
        Mail::assertSentCount(1);
    });

    it('writes the mail in the stored language, else the request language', function (): void {
        $arabic = passwordResetAccount(DashboardActorTypeEnum::Admin, 'arabic@example.test');
        passwordResetAccount(DashboardActorTypeEnum::Admin, 'english@example.test');
        PreferenceModel::query()->create([
            'preferenceable_type' => PreferenceableTypeEnum::Admin,
            'preferenceable_id' => $arabic->id,
            'preferred_language' => Locale::Ar,
        ]);

        $this->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => 'admin', 'email' => 'arabic@example.test'])->assertOk();
        $this->withHeader('Accept-Language', 'en')
            ->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => 'admin', 'email' => 'english@example.test'])->assertOk();

        Mail::assertSent(SendDashboardPasswordResetLink::class, fn (SendDashboardPasswordResetLink $mail): bool => $mail->hasTo('arabic@example.test') && $mail->locale === 'ar');
        Mail::assertSent(SendDashboardPasswordResetLink::class, fn (SendDashboardPasswordResetLink $mail): bool => $mail->hasTo('english@example.test') && $mail->locale === 'en');
    });

    it('resets the password once and signs every session out', function (DashboardActorTypeEnum $type): void {
        $account = passwordResetAccount($type, 'once@example.test');
        $account->createToken('mobile-session');
        $refresh = app(DashboardRefreshTokenResolver::class)->issue(new DashboardActor((string) $account->getKey(), $type, 'role'));
        $token = passwordResetRequestToken($this, $type, 'once@example.test');

        passwordResetSubmit($this, $type, 'once@example.test', $token)->assertOk();

        expect(Hash::check(RESET_NEW_PASSWORD, (string) $account->fresh()->getAuthPassword()))->toBeTrue()
            ->and($account->tokens()->count())->toBe(0)
            ->and(DashboardRefreshTokenModel::query()->whereNull('revoked_at')->count())->toBe(0)
            ->and(app(DashboardRefreshTokenResolver::class)->rotate($refresh))->toBeNull();
        passwordResetSubmit($this, $type, 'once@example.test', $token)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');
    })->with('dashboard account types');

    it('rejects an expired link', function (DashboardActorTypeEnum $type): void {
        passwordResetAccount($type, 'expired@example.test');
        $token = passwordResetRequestToken($this, $type, 'expired@example.test');

        $this->travel(61)->minutes();

        passwordResetSubmit($this, $type, 'expired@example.test', $token)->assertUnprocessable()->assertJsonValidationErrors('token');
    })->with('dashboard account types');

    it('gives one generic answer for a wrong token, email or portal', function (): void {
        $account = passwordResetAccount(DashboardActorTypeEnum::Admin, 'generic@example.test');
        $token = passwordResetRequestToken($this, DashboardActorTypeEnum::Admin, 'generic@example.test');

        $wrongToken = passwordResetSubmit($this, DashboardActorTypeEnum::Admin, 'generic@example.test', str_repeat('x', 64));
        $wrongEmail = passwordResetSubmit($this, DashboardActorTypeEnum::Admin, 'other@example.test', $token);
        $wrongPortal = passwordResetSubmit($this, DashboardActorTypeEnum::Branch, 'generic@example.test', $token);

        foreach ([$wrongToken, $wrongEmail, $wrongPortal] as $response) {
            $response->assertUnprocessable()->assertJsonPath('errors.token.0', $wrongToken->json('errors.token.0'));
        }
        expect(Hash::check('password', (string) $account->fresh()->getAuthPassword()))->toBeTrue();
    });

    it('re-checks dashboard access when the link is used', function (): void {
        $barber = passwordResetAccount(DashboardActorTypeEnum::Barber, 'lost-login@example.test');
        $owner = passwordResetAccount(DashboardActorTypeEnum::Owner, 'lost-brand@example.test');
        $barberToken = passwordResetRequestToken($this, DashboardActorTypeEnum::Barber, 'lost-login@example.test');
        $ownerToken = Password::broker('clients')->createToken($owner);

        $barber->forceFill(['has_login' => false])->save();
        BrandModel::query()->where('owner_id', $owner->id)->delete();

        passwordResetSubmit($this, DashboardActorTypeEnum::Barber, 'lost-login@example.test', $barberToken)->assertUnprocessable();
        passwordResetSubmit($this, DashboardActorTypeEnum::Owner, 'lost-brand@example.test', $ownerToken)->assertUnprocessable();
        expect(Hash::check('password', (string) $barber->fresh()->getAuthPassword()))->toBeTrue()
            ->and(Hash::check('password', (string) $owner->fresh()->getAuthPassword()))->toBeTrue();
    });

    it('burns a pending mobile reset code when the dashboard resets the password', function (): void {
        $branch = passwordResetAccount(DashboardActorTypeEnum::Branch, 'both@example.test');
        $owner = passwordResetAccount(DashboardActorTypeEnum::Owner, 'owner-both@example.test');
        app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');
        app(PasswordResetCodeVerifier::class)->issue((string) $owner->id, '654321');

        passwordResetSubmit($this, DashboardActorTypeEnum::Branch, 'both@example.test', passwordResetRequestToken($this, DashboardActorTypeEnum::Branch, 'both@example.test'))->assertOk();
        passwordResetSubmit($this, DashboardActorTypeEnum::Owner, 'owner-both@example.test', Password::broker('clients')->createToken($owner))->assertOk();

        expect(app(StaffPasswordResetCodes::class)->verify(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456'))->toBeFalse()
            ->and(app(PasswordResetCodeVerifier::class)->verify((string) $owner->id, '654321'))->toBeFalse();
    });

    it('voids an unused dashboard link when the password is reset in a mobile app', function (string $path, DashboardActorTypeEnum $type): void {
        $account = passwordResetAccount($type, 'mobile@example.test');
        $broker = Password::broker($type->passwordBroker()->value);
        $link = $broker->createToken($account);
        $type === DashboardActorTypeEnum::Owner
            ? app(PasswordResetCodeVerifier::class)->issue((string) $account->id, '111222')
            : app(StaffPasswordResetCodes::class)->issue($type === DashboardActorTypeEnum::Branch ? StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH : StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BARBER, (string) $account->id, '111222');

        $this->postJson($path, ['email' => 'mobile@example.test', 'code' => '111222', 'password' => RESET_NEW_PASSWORD, 'password_confirmation' => RESET_NEW_PASSWORD])->assertOk();

        expect($broker)->toBeInstanceOf(PasswordBroker::class)
            ->and($broker->tokenExists($account, $link))->toBeFalse();
    })->with([
        'client app' => ['/api/v1/client/reset-password', DashboardActorTypeEnum::Owner],
        'branch app' => ['/api/v1/branch/reset-password', DashboardActorTypeEnum::Branch],
        'stylist app' => ['/api/v1/barber/reset-password', DashboardActorTypeEnum::Barber],
    ]);
});
