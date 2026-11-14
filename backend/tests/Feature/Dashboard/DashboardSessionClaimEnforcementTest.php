<?php

declare(strict_types=1);

use Illuminate\Cache\ArrayStore;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Tests\TestCase;

/*
 * F-05: the X-Dashboard-Session claim is mandatory (D-01) and is bound to the exact Sanctum access token (`tid`), the actor (`sub`) and
 * the actor type. Refresh keeps the previous access token row (D-02) but no claim can authenticate it any more.
 */

const CLAIM_GUARD_SECRET = 'dashboard-session-secret-that-is-at-least-thirty-two-characters';

beforeEach(function (): void {
    $this->withoutMiddleware(ThrottleRequests::class);
    config(['dashboard.dashboard.session_secret' => CLAIM_GUARD_SECRET]);
});

/** Creates an account of the type, signs it in through the real login and returns the session. @return array{token: string, claim: string, refresh: string, id: string, type: string} */
function claimGuardSignIn(TestCase $test, string $type, string $email): array
{
    $account = match ($type) {
        'admin' => AdminModel::factory()->create(['email' => $email, 'password' => Hash::make('password')]),
        'branch' => BranchModel::factory()->create(['email' => $email, 'password' => Hash::make('password')]),
        'barber' => BarberModel::factory()->create(['email' => $email, 'password' => Hash::make('password'), 'has_login' => true, 'status' => BarberStatusEnum::Enabled]),
        'owner' => claimGuardOwner($email),
    };

    return claimGuardLogin($test, $type, $email, (string) $account->getKey());
}

function claimGuardOwner(string $email): ClientModel
{
    $owner = ClientModel::factory()->create(['email' => $email, 'password' => Hash::make('password')]);
    BrandModel::factory()->create(['owner_id' => $owner->id]);

    return $owner;
}

/** @return array{token: string, claim: string, refresh: string, id: string, type: string} */
function claimGuardLogin(TestCase $test, string $type, string $email, string $id): array
{
    $data = $test->postJson('/api/v1/dashboard/login', ['actor_type' => $type, 'email' => $email, 'password' => 'password'])
        ->assertOk()->json('data');

    return ['token' => (string) $data['token'], 'claim' => (string) $data['claim'], 'refresh' => (string) $data['refresh_token'], 'id' => $id, 'type' => $type];
}

/** One isolated request: headers and the cached guards are reset first so nothing leaks from the previous call. */
function claimGuardGet(TestCase $test, ?string $token, ?string $claim, string $path = '/api/v1/dashboard/me'): TestResponse
{
    app('auth')->forgetGuards();
    $test->flushHeaders();
    $headers = array_filter([
        'Authorization' => $token === null ? null : 'Bearer '.$token,
        'X-Dashboard-Session' => $claim,
    ], static fn (?string $value): bool => $value !== null);

    return $test->withHeaders($headers)->getJson($path);
}

/** Signs an arbitrary payload with the test secret, optionally as another key id. @param array<string, mixed> $overrides */
function claimGuardForge(array $overrides, ?string $removeKey = null, string $kid = 'default'): string
{
    $base64 = static fn (string $value): string => rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    $payload = [
        'actor_type' => 'admin', 'sub' => 'x', 'tid' => '1', 'role' => 'platform_admin', 'iss' => 'dorak-backend',
        'iat' => time(), 'exp' => time() + 600, 'jti' => 'forged-'.bin2hex(random_bytes(4)), ...$overrides,
    ];
    if ($removeKey !== null) {
        unset($payload[$removeKey]);
    }
    $header = $base64((string) json_encode(['alg' => 'HS256', 'kid' => $kid, 'typ' => 'JWT']));
    $body = $base64((string) json_encode($payload));

    return $header.'.'.$body.'.'.$base64(hash_hmac('sha256', $header.'.'.$body, CLAIM_GUARD_SECRET, true));
}

/** @return array<string, mixed> */
function claimGuardPayload(string $claim): array
{
    return json_decode((string) base64_decode(strtr(explode('.', $claim)[1], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
}

describe('the claim is bound to its access token (tid)', function (): void {
    it('issues the claim for the id of the access token it was returned with', function (string $type): void {
        $session = claimGuardSignIn($this, $type, "{$type}@example.test");

        expect(claimGuardPayload($session['claim']))->toMatchArray(['tid' => explode('|', $session['token'])[0], 'sub' => $session['id'], 'actor_type' => $type]);
        claimGuardGet($this, $session['token'], $session['claim'])->assertOk()->assertJsonPath('data.actor_type', $type);
    })->with(['admin', 'branch', 'barber', 'owner']);

    it('rejects a request without a bearer even with a valid claim', function (): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');

        claimGuardGet($this, null, $session['claim'])->assertUnauthorized();
    });

    it('rejects a valid claim that was issued for another access token of the same actor', function (): void {
        $first = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $second = claimGuardLogin($this, 'admin', 'admin@example.test', $first['id']);

        claimGuardGet($this, $first['token'], $second['claim'])->assertUnauthorized();
        claimGuardGet($this, $second['token'], $first['claim'])->assertUnauthorized();
        claimGuardGet($this, $first['token'], $first['claim'])->assertOk();
        claimGuardGet($this, $second['token'], $second['claim'])->assertOk();
    });

    it('rejects a claim whose tid points at a different token id', function (): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');

        $forged = claimGuardForge(['sub' => $session['id'], 'tid' => '999999']);
        claimGuardGet($this, $session['token'], $forged)->assertUnauthorized();
    });
});

describe('missing, malformed or legacy claims', function (): void {
    it('rejects every non-valid claim state with 401', function (string $state): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $tid = explode('|', $session['token'])[0];
        $valid = ['sub' => $session['id'], 'tid' => $tid];

        $claim = match ($state) {
            'missing' => null,
            'empty' => '',
            'malformed' => 'not-a-jwt',
            'bad signature' => substr($session['claim'], 0, -4).'AAAA',
            'unknown kid' => claimGuardForge($valid, kid: 'retired'),
            'expired' => claimGuardForge([...$valid, 'iat' => time() - 900, 'exp' => time() - 60]),
            'wrong issuer' => claimGuardForge([...$valid, 'iss' => 'someone-else']),
            'legacy without tid' => claimGuardForge($valid, removeKey: 'tid'),
            'non-string tid' => claimGuardForge([...$valid, 'tid' => (int) $tid]),
        };

        claimGuardGet($this, $session['token'], $claim)->assertUnauthorized();
        claimGuardGet($this, $session['token'], $session['claim'])->assertOk();
    })->with(['missing', 'empty', 'malformed', 'bad signature', 'unknown kid', 'expired', 'wrong issuer', 'legacy without tid', 'non-string tid']);

    it('rejects a missing claim for every dashboard actor type', function (string $type): void {
        $session = claimGuardSignIn($this, $type, "{$type}@example.test");

        claimGuardGet($this, $session['token'], null)->assertUnauthorized();
    })->with(['admin', 'branch', 'barber', 'owner']);

    it('rejects a revoked claim while its token is still alive', function (): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');
        app(DashboardSessionClaim::class)->revokeClaim($session['claim']);

        claimGuardGet($this, $session['token'], $session['claim'])->assertUnauthorized();
        expect(PersonalAccessToken::query()->count())->toBe(1);
    });
});

describe('identity mismatches', function (): void {
    it('rejects the claim of another actor of the same type', function (): void {
        $one = claimGuardSignIn($this, 'admin', 'one@example.test');
        $two = claimGuardSignIn($this, 'admin', 'two@example.test');

        claimGuardGet($this, $one['token'], $two['claim'])->assertUnauthorized();
        claimGuardGet($this, $two['token'], $one['claim'])->assertUnauthorized();
    });

    it('rejects the claim of an actor of another type', function (): void {
        $admin = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $barber = claimGuardSignIn($this, 'barber', 'barber@example.test');

        claimGuardGet($this, $admin['token'], $barber['claim'])->assertUnauthorized();
        claimGuardGet($this, $barber['token'], $admin['claim'])->assertUnauthorized();
    });

    it('rejects a correctly signed claim whose sub or actor_type differs while tid matches', function (string $field, string $value): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $payload = ['sub' => $session['id'], 'tid' => explode('|', $session['token'])[0], 'actor_type' => 'admin'];

        claimGuardGet($this, $session['token'], claimGuardForge([...$payload, $field => $value]))->assertUnauthorized();
        claimGuardGet($this, $session['token'], claimGuardForge($payload))->assertOk();
    })->with([
        'other sub' => ['sub', 'another-actor-id'],
        'other actor type' => ['actor_type', 'barber'],
        'owner actor type' => ['actor_type', 'owner'],
    ]);
});

describe('refresh keeps the previous token row but not its authority (D-02)', function (): void {
    it('rejects old token A with the new claim B, the revoked claim A and no claim, and keeps A in the database', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $b = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk()->json('data');

        claimGuardGet($this, $a['token'], $b['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], $a['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], null)->assertUnauthorized();
        claimGuardGet($this, $b['token'], $a['claim'])->assertUnauthorized();
        claimGuardGet($this, $b['token'], $b['claim'])->assertOk();

        expect(claimGuardPayload($b['claim'])['tid'])->toBe(explode('|', (string) $b['token'])[0])
            ->and(claimGuardPayload($b['claim'])['tid'])->not->toBe(claimGuardPayload($a['claim'])['tid'])
            ->and(PersonalAccessToken::query()->count())->toBe(2);
    });

    it('rotates the refresh token for every actor type and binds the new claim to the new token', function (string $type): void {
        $session = claimGuardSignIn($this, $type, "{$type}@example.test");
        $next = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $session['refresh'], 'claim' => $session['claim']])->assertOk()->json('data');

        claimGuardGet($this, (string) $next['token'], (string) $next['claim'])->assertOk();
        claimGuardGet($this, $session['token'], (string) $next['claim'])->assertUnauthorized();
    })->with(['admin', 'branch', 'barber', 'owner']);
});

/** The id of the access token (the part before `|`) of a plain-text Sanctum token. */
function claimGuardTokenId(string $plainTextToken): string
{
    return explode('|', $plainTextToken)[0];
}

/** Registers a cache store that works like `array` but fails every write of a revocation key, as an unavailable cache would. */
function claimGuardBreakRevocationCache(): void
{
    Cache::extend('revocation-down', fn () => Cache::repository(new class extends ArrayStore
    {
        public function put($key, $value, $seconds): bool
        {
            if (str_starts_with((string) $key, 'dashboard:revoked-jti:')) {
                throw new RuntimeException('cache unavailable');
            }

            return parent::put($key, $value, $seconds);
        }
    }));
    config(['cache.stores.revocation-down' => ['driver' => 'revocation-down'], 'cache.default' => 'revocation-down']);
    app('cache')->forgetDriver('revocation-down');
}

describe('F-05e durable revocation: the superseded token expires in the database', function (): void {
    it('keeps old token A dead after a cache flush while retaining its row (D-02)', function (string $type): void {
        $a = claimGuardSignIn($this, $type, "{$type}@example.test");
        $b = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk()->json('data');

        Cache::flush();

        claimGuardGet($this, $a['token'], $a['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], (string) $b['claim'])->assertUnauthorized();
        claimGuardGet($this, (string) $b['token'], (string) $b['claim'])->assertOk();

        $old = PersonalAccessToken::query()->findOrFail(claimGuardTokenId($a['token']));
        $new = PersonalAccessToken::query()->findOrFail(claimGuardTokenId((string) $b['token']));
        expect($old->expires_at->isPast())->toBeTrue()
            ->and($new->expires_at->isFuture())->toBeTrue()
            ->and(PersonalAccessToken::query()->count())->toBe(2);
    })->with(['admin', 'branch', 'barber', 'owner']);

    it('does not lose the new session when the cache cannot store the revocation, and A is still dead', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');
        claimGuardBreakRevocationCache();

        $b = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk()->json('data');

        claimGuardGet($this, (string) $b['token'], (string) $b['claim'])->assertOk();
        claimGuardGet($this, $a['token'], $a['claim'])->assertUnauthorized();
    });
});

describe('F-05h the refresh token is validated before anything is revoked', function (): void {
    it('revokes nothing for an invalid refresh token, even with a live claim', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => str_repeat('x', 64), 'claim' => $a['claim']])->assertUnauthorized();

        claimGuardGet($this, $a['token'], $a['claim'])->assertOk();
        expect(PersonalAccessToken::query()->findOrFail(claimGuardTokenId($a['token']))->expires_at->isFuture())->toBeTrue();
    });

    it('does not touch another actor\'s session when a foreign claim or a forged tid is sent with a valid refresh token', function (): void {
        $x = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $x2 = claimGuardSignIn($this, 'admin', 'admin2@example.test');
        $y = claimGuardSignIn($this, 'branch', 'branch@example.test');
        // Signed by the server key, subject x2, but naming the access token of another actor (y).
        $forged = claimGuardForge(['sub' => $x2['id'], 'actor_type' => 'admin', 'tid' => claimGuardTokenId($y['token'])]);

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $x['refresh'], 'claim' => $y['claim']])->assertOk();
        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $x2['refresh'], 'claim' => $forged])->assertOk();

        claimGuardGet($this, $y['token'], $y['claim'])->assertOk();
        expect(PersonalAccessToken::query()->findOrFail(claimGuardTokenId($y['token']))->expires_at->isFuture())->toBeTrue();
    });

    it('lets a losing refresh with the used token fail without invalidating the winner session', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $b = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk()->json('data');

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertUnauthorized();

        claimGuardGet($this, (string) $b['token'], (string) $b['claim'])->assertOk();
        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => (string) $b['refresh_token'], 'claim' => (string) $b['claim']])->assertOk();
    });
});

describe('F-05i a failure while issuing the new session does not consume the old one', function (): void {
    it('rolls the rotation back, keeps the refresh token usable and leaves the old pair valid', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');
        // The access token row is created first; the claim then fails because no signing secret is configured.
        config(['dashboard.dashboard.session_secret' => '', 'dashboard.dashboard.session_secrets' => '']);

        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertServerError();

        config(['dashboard.dashboard.session_secret' => CLAIM_GUARD_SECRET]);
        expect(DashboardRefreshTokenModel::query()->count())->toBe(1)
            ->and(DashboardRefreshTokenModel::query()->whereNull('revoked_at')->count())->toBe(1)
            ->and(PersonalAccessToken::query()->count())->toBe(1)
            ->and(PersonalAccessToken::query()->findOrFail(claimGuardTokenId($a['token']))->expires_at->isFuture())->toBeTrue();
        claimGuardGet($this, $a['token'], $a['claim'])->assertOk();
        $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk();
    });
});

describe('logout', function (): void {
    it('revokes the claim of the request and deletes the current token, leaving no way to reuse the older token', function (): void {
        $a = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $b = $this->postJson('/api/v1/dashboard/refresh', ['refresh_token' => $a['refresh'], 'claim' => $a['claim']])->assertOk()->json('data');

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->withHeaders(['Authorization' => 'Bearer '.$b['token'], 'X-Dashboard-Session' => $b['claim']])
            ->postJson('/api/v1/dashboard/logout')->assertOk();

        claimGuardGet($this, (string) $b['token'], (string) $b['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], (string) $b['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], $a['claim'])->assertUnauthorized();
        claimGuardGet($this, $a['token'], null)->assertUnauthorized();
        expect(PersonalAccessToken::query()->count())->toBe(1)
            ->and(app(DashboardSessionClaim::class)->isValid((string) $b['claim']))->toBeFalse();
    });

    it('revokes the validated header claim, not a claim sent in the body, and leaves other sessions alone', function (): void {
        $first = claimGuardSignIn($this, 'admin', 'admin@example.test');
        $second = claimGuardLogin($this, 'admin', 'admin@example.test', $first['id']);

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->withHeaders(['Authorization' => 'Bearer '.$first['token'], 'X-Dashboard-Session' => $first['claim']])
            ->postJson('/api/v1/dashboard/logout', ['claim' => $second['claim']])->assertOk();

        expect(app(DashboardSessionClaim::class)->isValid($first['claim']))->toBeFalse()
            ->and(app(DashboardSessionClaim::class)->isValid($second['claim']))->toBeTrue();
    });

    it('requires the claim on logout itself', function (): void {
        $session = claimGuardSignIn($this, 'admin', 'admin@example.test');

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->withHeader('Authorization', 'Bearer '.$session['token'])->postJson('/api/v1/dashboard/logout')->assertUnauthorized();
        expect(PersonalAccessToken::query()->count())->toBe(1);
    });
});

describe('dashboard and mobile isolation', function (): void {
    it('keeps mobile-scoped routes free of the dashboard claim', function (): void {
        $branch = BranchModel::factory()->create();
        $token = $branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->withToken($token)->getJson('/api/v1/branch/earnings')->assertOk()->assertJsonPath('data.scope', 'branch');
    });

    it('does not let a mobile-app token or a bound claim reach the dashboard', function (): void {
        $branch = BranchModel::factory()->create();
        $access = $branch->createToken('branch-app', TokenAbility::forBranchApp());
        $claim = app(DashboardSessionClaim::class)->issue(new DashboardActor((string) $branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', (string) $branch->id), $access->accessToken->getKey());

        expect(claimGuardGet($this, $access->plainTextToken, $claim)->status())->toBeIn([401, 403]);
    });
});
