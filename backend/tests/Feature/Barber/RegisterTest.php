<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Constants\BarberEmailVerificationConstants;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Mail\BarberEmailVerificationCode;
use Modules\Barber\Models\BarberModel;

beforeEach(function (): void {
    $this->withoutMiddleware(ThrottleRequests::class);
    Mail::fake();
});

function barberSignUpPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Omar Fade',
        'email' => 'omar@example.com',
        'password' => 'secret-pass-1',
        'password_confirmation' => 'secret-pass-1',
    ], $overrides);
}

function registerBarber(array $overrides = []): array
{
    $response = test()->postJson('/api/v1/barber/register', barberSignUpPayload($overrides))->assertCreated();

    return [$response->json('data.token'), BarberModel::query()->where('email', $response->json('data.barber.email'))->firstOrFail()];
}

function seedBarberEmailCode(BarberModel $barber, string $code = '123456'): void
{
    Cache::put("barber_email_verify_{$barber->id}", Hash::make($code), now()->addMinutes(10));
}

describe('POST /api/v1/barber/register', function (): void {
    it('creates a pending freelancer with a hashed password and returns a token', function (): void {
        $response = $this->postJson('/api/v1/barber/register', barberSignUpPayload())
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.barber.email', 'omar@example.com')
            ->assertJsonPath('data.barber.status', 'pending')
            ->assertJsonPath('data.barber.is_freelancer', true)
            ->assertJsonPath('data.barber.email_verified_at', null);

        expect($response->json('data.token'))->toBeString()->not->toBeEmpty();

        $barber = BarberModel::query()->where('email', 'omar@example.com')->firstOrFail();
        expect($barber->status)->toBe(BarberStatusEnum::Pending)
            ->and($barber->has_login)->toBeTrue()
            ->and($barber->password)->not->toBe('secret-pass-1')
            ->and(Hash::check('secret-pass-1', $barber->password))->toBeTrue();

        Mail::assertSent(BarberEmailVerificationCode::class, fn ($mail) => $mail->hasTo('omar@example.com'));
    });

    it('records a shop barber when is_freelancer is false', function (): void {
        $this->postJson('/api/v1/barber/register', barberSignUpPayload(['is_freelancer' => false]))
            ->assertCreated()
            ->assertJsonPath('data.barber.is_freelancer', false);
    });

    it('rejects a duplicate email', function (): void {
        BarberModel::factory()->create(['email' => 'omar@example.com']);

        $this->postJson('/api/v1/barber/register', barberSignUpPayload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        expect(BarberModel::query()->where('email', 'omar@example.com')->count())->toBe(1);
    });

    it('rejects a missing or unconfirmed password', function (array $payload): void {
        $this->postJson('/api/v1/barber/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        expect(BarberModel::query()->count())->toBe(0);
    })->with([
        'missing' => fn (): array => array_diff_key(barberSignUpPayload(), ['password' => true]),
        'unconfirmed' => fn (): array => barberSignUpPayload(['password_confirmation' => 'different-pass']),
    ]);

    it('is throttled like the other auth routes', function (): void {
        $this->withMiddleware(ThrottleRequests::class);

        foreach (range(1, 5) as $_) {
            expect($this->postJson('/api/v1/barber/register', [])->status())->not->toBe(429);
        }

        $this->postJson('/api/v1/barber/register', [])->assertTooManyRequests();
    });
});

describe('the sign-up token of a pending barber', function (): void {
    it('authenticates GET barber/profile', function (): void {
        [$token] = registerBarber();

        $this->withToken($token)
            ->getJson('/api/v1/barber/profile')
            ->assertOk()
            ->assertJsonPath('data.email', 'omar@example.com')
            ->assertJsonPath('data.status', 'pending');
    });

    it('cannot reach operational routes or activate itself', function (string $method, string $path): void {
        [$token, $barber] = registerBarber();

        $this->withToken($token)
            ->json($method, str_replace('{barber}', $barber->id, $path))
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Pending);
    })->with([
        'today appointments' => ['GET', '/api/v1/barber/appointments/today'],
        'schedule' => ['GET', '/api/v1/barber/schedule'],
        'workstation status' => ['PATCH', '/api/v1/barber/workstation-status'],
        'self activation' => ['POST', '/api/v1/barbers/{barber}/activate'],
        'self deactivation' => ['POST', '/api/v1/barbers/{barber}/deactivate'],
        'affiliations' => ['GET', '/api/v1/barbers/{barber}/affiliations'],
        'job applications' => ['GET', '/api/v1/applications'],
    ]);

    it('gains full access only after an admin activates the barber', function (): void {
        [$token, $barber] = registerBarber();

        $this->withToken($token)->getJson('/api/v1/barber/schedule')->assertForbidden();

        $this->actingAs(AdminModel::factory()->create(), 'admin_api')
            ->postJson("/api/v1/admin/barbers/{$barber->id}/activate", ['reason' => 'Vetted'])
            ->assertSuccessful();
        expect($barber->fresh()->status)->toBe(BarberStatusEnum::Enabled);

        app('auth')->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/barber/schedule')->assertOk();

        $this->postJson('/api/v1/barber/login', ['email' => 'omar@example.com', 'password' => 'secret-pass-1'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['token']]);
    });
});

describe('login of a pending barber', function (): void {
    it('is refused with ACCOUNT_NOT_ACTIVE', function (): void {
        registerBarber();

        $this->postJson('/api/v1/barber/login', ['email' => 'omar@example.com', 'password' => 'secret-pass-1'])
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
    });
});

describe('barber email verification', function (): void {
    it('verifies the email with the emailed code', function (): void {
        [$token, $barber] = registerBarber();
        seedBarberEmailCode($barber);

        $this->withToken($token)
            ->postJson('/api/v1/barber/email/verify', ['code' => '123456'])
            ->assertOk()
            ->assertJsonPath('data.id', $barber->id);

        expect($barber->fresh()->email_verified_at)->not->toBeNull()
            ->and($barber->fresh()->status)->toBe(BarberStatusEnum::Pending);
    });

    it('rejects a wrong code with a code field error', function (): void {
        [$token, $barber] = registerBarber();
        seedBarberEmailCode($barber);

        $this->withToken($token)
            ->postJson('/api/v1/barber/email/verify', ['code' => '000000'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'VALIDATION_FAILED')
            ->assertJsonStructure(['errors' => ['code']]);

        expect($barber->fresh()->email_verified_at)->toBeNull();
    });

    it('discards the code after five wrong attempts', function (): void {
        [$token, $barber] = registerBarber();
        seedBarberEmailCode($barber);

        foreach (range(1, BarberEmailVerificationConstants::BARBER_EMAIL_VERIFICATION_MAX_ATTEMPTS) as $_) {
            $this->withToken($token)->postJson('/api/v1/barber/email/verify', ['code' => '000000'])->assertStatus(422);
        }

        $this->withToken($token)->postJson('/api/v1/barber/email/verify', ['code' => '123456'])->assertStatus(422);
        expect($barber->fresh()->email_verified_at)->toBeNull();
    });

    it('resends a code and stores it hashed', function (): void {
        [$token, $barber] = registerBarber();
        Mail::fake();

        $this->withToken($token)->postJson('/api/v1/barber/email/verify/send')->assertOk();

        Mail::assertSent(BarberEmailVerificationCode::class, function (BarberEmailVerificationCode $mail) use ($barber): bool {
            $cached = Cache::get("barber_email_verify_{$barber->id}");

            return $cached !== $mail->code && Hash::check($mail->code, $cached);
        });
    });

    it('does not send a code to an already verified barber', function (): void {
        $barber = BarberModel::factory()->create(['email_verified_at' => now(), 'has_login' => true]);
        $token = $barber->createToken('barber-app')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/barber/email/verify/send')->assertOk();

        Mail::assertNothingSent();
    });
});

describe('existing barber tokens', function (): void {
    it('stop working on operational routes once the barber is disabled', function (): void {
        $barber = BarberModel::factory()->create(['has_login' => true]);
        $token = $barber->createToken('barber-app')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/barber/schedule')->assertOk();

        $barber->forceFill(['status' => BarberStatusEnum::Disabled])->save();
        app('auth')->forgetGuards();

        $this->withToken($token)->getJson('/api/v1/barber/schedule')
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
    });

    it('still allow a disabled barber to reactivate themselves', function (): void {
        $barber = BarberModel::factory()->create(['has_login' => true, 'status' => BarberStatusEnum::Disabled]);
        $token = $barber->createToken('barber-app')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/v1/barbers/{$barber->id}/activate", ['reason' => 'Back to work'])
            ->assertSuccessful();
    });
});
