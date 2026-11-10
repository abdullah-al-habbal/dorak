<?php

declare(strict_types=1);

use Illuminate\Support\Defer\DeferredCallbackCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Mail\SendEmailVerificationCode;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;
use Modules\Client\Services\ClientAccountDeletion;
use Modules\Currency\Models\CurrencyModel;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;
use Modules\Dashboard\Mail\OwnerBrandApproved;
use Modules\Dashboard\Mail\OwnerBrandRejected;
use Modules\Dashboard\Mail\OwnerBrandSubmitted;
use Modules\OfferedService\Models\OfferedServiceModel;

const OWNER_REG_PASSWORD = 'a-long-owner-password-1';

/** @return array<string, mixed> */
function ownerRegistrationPayload(string $email = 'new.owner@example.test', array $brand = []): array
{
    return [
        'owner' => ['name' => 'Nour Owner', 'email' => $email, 'password' => OWNER_REG_PASSWORD, 'password_confirmation' => OWNER_REG_PASSWORD, 'phone' => null],
        'brand' => [...['name' => ['en' => 'Nour Cuts', 'ar' => 'نور كتس'], 'base_currency_code' => test()->currency->code], ...$brand],
    ];
}

/** Runs the work the registration defers until after the response, as the server would. */
function ownerRegistrationRun(mixed $test, string $uri, array $payload): mixed
{
    $response = $test->postJson("/api/v1/dashboard/owner/{$uri}", $payload);
    app(DeferredCallbackCollection::class)->invoke();

    return $response;
}

function ownerRegistrationCode(ClientModel $client): string
{
    return (string) Cache::get("email_verify_{$client->id}");
}

describe('Owner self-registration', function (): void {
    beforeEach(function (): void {
        Mail::fake();
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
        $this->currency = CurrencyModel::factory()->create();
    });

    it('creates an unverified owner with a pending brand and one pending branch, then mails a code', function (): void {
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload())->assertOk();

        $client = ClientModel::query()->where('email', 'new.owner@example.test')->firstOrFail();
        $brand = BrandModel::query()->where('owner_id', $client->id)->firstOrFail();

        expect($client->email_verified_at)->toBeNull()
            ->and($brand->status)->toBe(BrandStatusEnum::Pending)
            ->and($brand->branches()->count())->toBe(1);
        Mail::assertSent(SendEmailVerificationCode::class, 1);
    });

    it('verifies the code, opens an owner session and mails the submitted email', function (): void {
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload());
        $client = ClientModel::query()->where('email', 'new.owner@example.test')->firstOrFail();

        $session = $this->postJson('/api/v1/dashboard/owner/verify', ['email' => 'New.Owner@example.test', 'code' => ownerRegistrationCode($client)])
            ->assertOk()->json('data');

        expect($session)->toHaveKeys(['claim', 'token', 'refresh_token'])
            ->and($client->refresh()->email_verified_at)->not->toBeNull();
        Mail::assertQueued(OwnerBrandSubmitted::class, 1);
    });

    it('refuses a wrong code and never signs in an account that is already verified', function (): void {
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload());
        $client = ClientModel::query()->where('email', 'new.owner@example.test')->firstOrFail();

        $this->postJson('/api/v1/dashboard/owner/verify', ['email' => $client->email, 'code' => '000000'])->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/owner/verify', ['email' => 'nobody@example.test', 'code' => '123456'])->assertUnprocessable();

        $verified = ClientModel::factory()->create(['email' => 'verified@example.test']);
        Cache::put("email_verify_{$verified->id}", '123456', 600);
        $this->postJson('/api/v1/dashboard/owner/verify', ['email' => $verified->email, 'code' => '123456'])->assertUnprocessable();
    });

    it('answers a repeat sign-up of an unverified email the same way, resends the code, and changes nothing', function (): void {
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload());
        $first = ClientModel::query()->where('email', 'new.owner@example.test')->firstOrFail();
        $passwordHash = $first->password;

        $other = ownerRegistrationPayload('new.owner@example.test', ['name' => ['en' => 'Hijack', 'ar' => 'اختراق']]);
        $other['owner']['password'] = $other['owner']['password_confirmation'] = 'another-password-2345';
        $repeat = ownerRegistrationRun($this, 'register', $other);

        expect(ClientModel::query()->where('email', 'new.owner@example.test')->count())->toBe(1)
            ->and(BrandModel::query()->where('owner_id', $first->id)->count())->toBe(1)
            ->and($first->refresh()->password)->toBe($passwordHash);
        $repeat->assertOk();
        Mail::assertSent(SendEmailVerificationCode::class, 2);
    });

    it('gives one identical answer for new, unverified, verified and banned emails', function (): void {
        $verified = ClientModel::factory()->create(['email' => 'verified@example.test']);
        $banned = ClientModel::factory()->unverified()->create(['email' => 'banned@example.test']);
        BanModel::query()->create(['bannable_type' => $banned->getMorphClass(), 'bannable_id' => $banned->id, 'banned_at' => now()->subDay(), 'expires_at' => null, 'reason' => 'test']);

        $bodies = collect(['fresh@example.test', $verified->email, $banned->email])
            ->map(fn (string $email) => ownerRegistrationRun($this, 'register', ownerRegistrationPayload($email))->assertOk()->json());

        expect($bodies->map(fn (array $body) => Arr::except($body, 'timestamp'))->unique()->count())->toBe(1);
        expect($verified->refresh()->password)->not->toBe(Hash::make(OWNER_REG_PASSWORD))
            ->and(BrandModel::query()->where('owner_id', $verified->id)->exists())->toBeFalse()
            ->and(BrandModel::query()->where('owner_id', $banned->id)->exists())->toBeFalse();
        Mail::assertSent(SendEmailVerificationCode::class, 1);
    });

    it('does nothing when the honeypot is filled, with the same answer', function (): void {
        $payload = [...ownerRegistrationPayload('bot@example.test'), OwnerRegistrationConstants::HONEYPOT_FIELD => 'http://spam.test'];

        ownerRegistrationRun($this, 'register', $payload)->assertOk();

        expect(ClientModel::query()->where('email', 'bot@example.test')->exists())->toBeFalse();
        Mail::assertNothingSent();
    });

    it('rejects a duplicate first-branch email with a validation error and creates nothing', function (): void {
        $taken = BranchModel::factory()->create(['email' => 'branch@example.test']);
        $payload = ownerRegistrationPayload('new.owner@example.test', ['first_branch' => ['email' => $taken->email, 'password' => 'a-branch-password-1']]);

        ownerRegistrationRun($this, 'register', $payload)->assertUnprocessable()->assertJsonValidationErrors('brand.first_branch.email');

        expect(ClientModel::query()->where('email', 'new.owner@example.test')->exists())->toBeFalse();
    });

    it('lets the same email exist as a barber account', function (): void {
        BarberModel::factory()->create(['email' => 'shared@example.test']);

        ownerRegistrationRun($this, 'register', ownerRegistrationPayload('shared@example.test'))->assertOk();

        expect(ClientModel::query()->where('email', 'shared@example.test')->exists())->toBeTrue();
    });

    it('resends a code only to an unverified account, with the same answer for any email', function (): void {
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload());

        ownerRegistrationRun($this, 'code/resend', ['email' => ' New.Owner@example.test '])->assertOk();
        ownerRegistrationRun($this, 'code/resend', ['email' => 'ghost@example.test'])->assertOk();

        Mail::assertSent(SendEmailVerificationCode::class, 2);
    });

    it('limits sign-ups per email regardless of case, and per IP', function (): void {
        $limit = OwnerRegistrationConstants::OWNER_REGISTER_PER_EMAIL_PER_HOUR;

        for ($i = 1; $i <= $limit; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => "198.51.100.{$i}"])->postJson('/api/v1/dashboard/owner/code/resend', ['email' => 'Flood@Example.test'])->assertOk();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.99'])->postJson('/api/v1/dashboard/owner/code/resend', ['email' => ' flood@example.test'])->assertTooManyRequests();

        $ipLimit = OwnerRegistrationConstants::OWNER_REGISTER_PER_IP_PER_MINUTE;
        for ($i = 1; $i <= $ipLimit; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->postJson('/api/v1/dashboard/owner/code/resend', ['email' => "user{$i}@example.test"])->assertOk();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->postJson('/api/v1/dashboard/owner/code/resend', ['email' => 'user99@example.test'])->assertTooManyRequests();
    });

    it('caps code guesses per email', function (): void {
        $client = ClientModel::factory()->unverified()->create(['email' => 'guess@example.test']);
        Cache::put("email_verify_{$client->id}", '123456', 600);
        $limit = OwnerRegistrationConstants::OWNER_VERIFY_PER_EMAIL_PER_HOUR;

        for ($i = 1; $i <= $limit; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => "198.51.100.{$i}"])->postJson('/api/v1/dashboard/owner/verify', ['email' => $client->email, 'code' => '000000'])->assertUnprocessable();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.99'])->postJson('/api/v1/dashboard/owner/verify', ['email' => $client->email, 'code' => '123456'])->assertTooManyRequests();
    });
});

describe('An existing client becomes an owner', function (): void {
    beforeEach(function (): void {
        Mail::fake();
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
        $this->currency = CurrencyModel::factory()->create();
    });

    it('signs in with the password, creates the first brand on the same account, and gets a session', function (): void {
        $client = ClientModel::factory()->create(['email' => 'app.client@example.test', 'password' => Hash::make(OWNER_REG_PASSWORD)]);

        $payload = ['email' => 'App.Client@example.test', 'password' => OWNER_REG_PASSWORD, 'brand' => ownerRegistrationPayload()['brand']];
        $this->postJson('/api/v1/dashboard/owner/brand', $payload)->assertCreated()->assertJsonStructure(['data' => ['token']]);

        expect(BrandModel::query()->where('owner_id', $client->id)->count())->toBe(1);
        Mail::assertQueued(OwnerBrandSubmitted::class, 1);
    });

    it('refuses a wrong password, an unverified account, and a second brand alike', function (): void {
        $brand = ownerRegistrationPayload()['brand'];
        $client = ClientModel::factory()->create(['email' => 'app.client@example.test', 'password' => Hash::make(OWNER_REG_PASSWORD)]);
        $unverified = ClientModel::factory()->unverified()->create(['email' => 'unverified@example.test', 'password' => Hash::make(OWNER_REG_PASSWORD)]);
        BrandModel::factory()->create(['owner_id' => ClientModel::factory()->create(['email' => 'has.brand@example.test', 'password' => Hash::make(OWNER_REG_PASSWORD)])->id]);

        foreach ([[$client->email, 'wrong-password-123'], [$unverified->email, OWNER_REG_PASSWORD], ['has.brand@example.test', OWNER_REG_PASSWORD]] as [$email, $password]) {
            $this->postJson('/api/v1/dashboard/owner/brand', compact('email', 'password', 'brand'))->assertUnauthorized();
        }
        expect(BrandModel::query()->where('owner_id', $client->id)->exists())->toBeFalse();
    });

    it('refuses a banned account', function (): void {
        $client = ClientModel::factory()->create(['email' => 'banned@example.test', 'password' => Hash::make(OWNER_REG_PASSWORD)]);
        BanModel::query()->create(['bannable_type' => $client->getMorphClass(), 'bannable_id' => $client->id, 'banned_at' => now()->subDay(), 'expires_at' => null, 'reason' => 'test']);

        $this->postJson('/api/v1/dashboard/owner/brand', ['email' => $client->email, 'password' => OWNER_REG_PASSWORD, 'brand' => ownerRegistrationPayload()['brand']])->assertForbidden();
    });
});

describe('Review queue and approval', function (): void {
    beforeEach(function (): void {
        Mail::fake();
    });

    it('lists only brands whose owner confirmed their email', function (): void {
        $verified = BrandModel::factory()->pending()->create();
        $unverified = BrandModel::factory()->pending()->create(['owner_id' => ClientModel::factory()->unverified()->create()->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $ids = collect($this->getJson('/api/v1/dashboard/brands?status=pending')->assertOk()->json('data'))->pluck('id');

        expect($ids)->toContain($verified->id)->not->toContain($unverified->id);
    });

    it('refuses to approve an unverified owner and mails the owner on a real approval', function (): void {
        $unverified = BrandModel::factory()->pending()->create(['owner_id' => ClientModel::factory()->unverified()->create()->id]);
        $verified = BrandModel::factory()->pending()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson("/api/v1/dashboard/admin/brands/{$unverified->id}/approve")->assertUnprocessable();
        $this->patchJson("/api/v1/dashboard/admin/brands/{$verified->id}/approve")->assertOk();
        $this->patchJson("/api/v1/dashboard/admin/brands/{$verified->id}/approve")->assertOk();

        expect($unverified->refresh()->status)->toBe(BrandStatusEnum::Pending)
            ->and($verified->refresh()->status)->toBe(BrandStatusEnum::Active);
        Mail::assertQueued(OwnerBrandApproved::class, 1);
    });
});

describe('A pending brand has early access only (D11)', function (): void {
    beforeEach(function (): void {
        $this->owner = ClientModel::factory()->create();
        $this->brand = BrandModel::factory()->pending()->create(['owner_id' => $this->owner->id]);
        $this->branch = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
        $this->authenticateDashboardActor($this->owner);
    });

    it('blocks a second branch, stylist invitations and walk-in bookings, server-side', function (): void {
        $this->postJson('/api/v1/dashboard/branches', ['brand_id' => $this->brand->id, 'name' => ['en' => 'B2', 'ar' => 'ب٢'], 'email' => 'b2@example.test', 'password' => 'a-branch-password-1'])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
        $this->postJson("/api/v1/dashboard/branches/{$this->branch->id}/affiliations", ['barber_id' => BarberModel::factory()->create()->id])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
    });

    it('blocks adding a stylist and taking a walk-in booking', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);

        $this->postJson('/api/v1/dashboard/stylists', ['name' => ['en' => 'New Stylist', 'ar' => 'حلاق جديد'], 'email' => 'new-stylist@example.test', 'phone' => '00963000000000', 'password' => 'secure-dashboard-password', 'chair_id' => $chair->id])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
        $this->postJson('/api/v1/dashboard/bookings/walk-in', ['branch_id' => $this->branch->id, 'chair_id' => $chair->id, 'barber_id' => BarberModel::factory()->create()->id, 'customer_name' => 'Walk In', 'customer_email' => 'walk@example.test', 'service_ids' => [OfferedServiceModel::factory()->create(['serviceable_id' => $this->brand->id, 'duration_minutes' => 30])->id], 'starts_at' => now()->addDay()->toIso8601String()])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
        $this->assertDatabaseCount('bookings', 0);
    });

    it('lets the owner edit the brand profile and prepare the one branch', function (): void {
        $this->putJson("/api/v1/dashboard/brands/{$this->brand->id}", ['name' => ['en' => 'Renamed', 'ar' => 'جديد'], 'base_currency_code' => $this->brand->base_currency_code])->assertOk();
        $this->getJson("/api/v1/dashboard/branches/{$this->branch->id}")->assertOk();
    });
});

describe('Never-verified sign-up clean-up', function (): void {
    it('removes old unverified sign-ups with their pending brand, and keeps everything else', function (): void {
        $old = now()->subDays(OwnerRegistrationConstants::UNVERIFIED_SIGNUP_RETENTION_DAYS + 1);
        $stale = ClientModel::factory()->unverified()->create(['status' => 'pending', 'created_at' => $old]);
        $staleBrand = BrandModel::factory()->pending()->create(['owner_id' => $stale->id]);
        $fresh = ClientModel::factory()->unverified()->create(['status' => 'pending', 'created_at' => now()->subDay()]);
        $verified = ClientModel::factory()->create(['created_at' => $old]);
        $social = ClientModel::factory()->unverified()->create(['status' => 'pending', 'created_at' => $old]);
        SocialAccountModel::factory()->create(['client_id' => $social->id]);
        $activeOwner = ClientModel::factory()->unverified()->create(['status' => 'pending', 'created_at' => $old]);
        BrandModel::factory()->create(['owner_id' => $activeOwner->id]);

        $this->artisan(OwnerRegistrationConstants::PURGE_COMMAND)->assertSuccessful();

        expect(ClientModel::query()->find($stale->id))->toBeNull()
            ->and(BrandModel::query()->find($staleBrand->id))->toBeNull()
            ->and($stale->refresh()->email)->toStartWith('deleted-')
            ->and(ClientModel::query()->find($fresh->id))->not->toBeNull()
            ->and(ClientModel::query()->find($verified->id))->not->toBeNull()
            ->and(ClientModel::query()->find($social->id))->not->toBeNull()
            ->and(ClientModel::query()->find($activeOwner->id))->not->toBeNull();
    });
});

describe('Owner emails', function (): void {
    it('renders the three review emails in English and Arabic', function (string $locale, string $needle): void {
        $brand = BrandModel::factory()->create();
        $owner = $brand->owner;
        foreach ([new OwnerBrandSubmitted('Nour Cuts', 'https://x.test'), new OwnerBrandApproved('Nour Cuts', 'https://x.test'), new OwnerBrandRejected('Nour Cuts', 'Photo missing', 'https://x.test')] as $mail) {
            $rendered = $mail->locale($locale)->render();
            expect($rendered)->toContain('Nour Cuts')->toContain($needle)->not->toContain(':name');
        }
        expect($owner)->not->toBeNull();
    })->with([['en', 'Open your dashboard'], ['ar', 'افتح لوحة التحكم']]);

    it('queues the submitted email in the owner language after verification', function (): void {
        Mail::fake();
        config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
        $this->currency = CurrencyModel::factory()->create();
        app()->setLocale('ar');
        ownerRegistrationRun($this, 'register', ownerRegistrationPayload());
        $client = ClientModel::query()->where('email', 'new.owner@example.test')->firstOrFail();
        app()->setLocale('en');

        $this->postJson('/api/v1/dashboard/owner/verify', ['email' => $client->email, 'code' => ownerRegistrationCode($client)])->assertOk();

        Mail::assertQueued(OwnerBrandSubmitted::class, fn (OwnerBrandSubmitted $mail): bool => $mail->locale === 'ar');
    });
});

describe('Deleted accounts free their email (D10)', function (): void {
    it('anonymises name, email and phone, and the email registers fresh', function (): void {
        Mail::fake();
        $this->currency = CurrencyModel::factory()->create();
        $client = ClientModel::factory()->create(['email' => 'gone@example.test', 'phone' => '+963911000111']);

        expect(app(ClientAccountDeletion::class)->delete($client))->toBeTrue();
        $client->refresh();
        expect($client->email)->not->toBe('gone@example.test')->and($client->phone)->toBeNull();

        ownerRegistrationRun($this, 'register', ownerRegistrationPayload('gone@example.test'))->assertOk();

        expect(ClientModel::query()->where('email', 'gone@example.test')->count())->toBe(1);
    });
});
