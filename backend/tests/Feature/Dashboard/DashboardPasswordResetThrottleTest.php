<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Modules\Admin\Models\AdminModel;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;

const THROTTLE_TRUSTED_PROXY = '10.0.0.5';

function throttleForgot(mixed $test, string $email, string $remoteAddr = '198.51.100.1', ?string $forwardedFor = null): mixed
{
    $headers = $forwardedFor === null ? [] : ['X-Forwarded-For' => $forwardedFor];

    return $test->withServerVariables(['REMOTE_ADDR' => $remoteAddr])
        ->withHeaders($headers)
        ->postJson('/api/v1/dashboard/password/forgot', ['actor_type' => 'admin', 'email' => $email]);
}

describe('Dashboard password recovery limits', function (): void {
    beforeEach(function (): void {
        Mail::fake();
    });

    it('limits requests per email, counting unknown emails too', function (): void {
        $limit = DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_EMAIL_PER_HOUR;

        for ($i = 1; $i <= $limit; $i++) {
            throttleForgot($this, 'Nobody@Example.test', "198.51.100.{$i}")->assertOk();
        }

        throttleForgot($this, ' nobody@example.test ', '198.51.100.99')->assertTooManyRequests();
        throttleForgot($this, 'someone-else@example.test', '198.51.100.99')->assertOk();
    });

    it('limits requests per IP across different emails', function (): void {
        $limit = DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_IP_PER_MINUTE;

        for ($i = 1; $i <= $limit; $i++) {
            throttleForgot($this, "person{$i}@example.test")->assertOk();
        }

        throttleForgot($this, 'one-more@example.test')->assertTooManyRequests();
    });

    it('does not let junk reset attempts lock a victim out', function (): void {
        $victim = AdminModel::factory()->create(['email' => 'victim@example.test', 'password' => Hash::make('password')]);
        $token = Password::broker('admins')->createToken($victim);
        $junk = ['actor_type' => 'admin', 'email' => 'victim@example.test', 'token' => str_repeat('x', 64), 'password' => 'a-brand-new-password-123', 'password_confirmation' => 'a-brand-new-password-123'];

        foreach (range(1, 10) as $i) {
            $this->withServerVariables(['REMOTE_ADDR' => "203.0.113.{$i}"])->postJson('/api/v1/dashboard/password/reset', $junk)->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.50'])
            ->postJson('/api/v1/dashboard/password/reset', [...$junk, 'token' => $token])
            ->assertOk();
    });

    it('limits reset attempts per IP', function (): void {
        $junk = ['actor_type' => 'admin', 'email' => 'x@example.test', 'token' => 'nope', 'password' => 'a-brand-new-password-123', 'password_confirmation' => 'a-brand-new-password-123'];

        foreach (range(1, DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_PER_IP_PER_MINUTE) as $i) {
            $this->postJson('/api/v1/dashboard/password/reset', [...$junk, 'email' => "x{$i}@example.test"])->assertUnprocessable();
        }

        $this->postJson('/api/v1/dashboard/password/reset', $junk)->assertTooManyRequests();
    });

    it('counts each visitor separately behind the trusted dashboard server', function (): void {
        config(['trustedproxy.proxies' => THROTTLE_TRUSTED_PROXY]);
        $limit = DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_IP_PER_MINUTE;

        for ($i = 1; $i <= $limit; $i++) {
            throttleForgot($this, "a{$i}@example.test", THROTTLE_TRUSTED_PROXY, '203.0.113.10')->assertOk();
        }

        throttleForgot($this, 'a-next@example.test', THROTTLE_TRUSTED_PROXY, '203.0.113.10')->assertTooManyRequests();
        throttleForgot($this, 'b@example.test', THROTTLE_TRUSTED_PROXY, '203.0.113.20')->assertOk();
    });

    it('ignores a forwarded IP sent by anyone but the trusted dashboard server', function (): void {
        config(['trustedproxy.proxies' => THROTTLE_TRUSTED_PROXY]);
        $limit = DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_IP_PER_MINUTE;

        for ($i = 1; $i <= $limit; $i++) {
            throttleForgot($this, "c{$i}@example.test", '198.51.100.7', "203.0.113.{$i}")->assertOk();
        }

        throttleForgot($this, 'c-next@example.test', '198.51.100.7', '203.0.113.99')->assertTooManyRequests();
    });

    it('refuses a wildcard trusted-proxy setting', function (): void {
        // .env.example defines TRUSTED_PROXIES (empty), and env() reads $_ENV/$_SERVER before putenv, so set all
        // three sources and restore them exactly, or the test passes only on machines without that variable.
        $name = 'TRUSTED_PROXIES';
        $hadEnv = array_key_exists($name, $_ENV);
        $hadServer = array_key_exists($name, $_SERVER);
        $oldEnv = $_ENV[$name] ?? null;
        $oldServer = $_SERVER[$name] ?? null;
        $oldPutenv = getenv($name);

        putenv("{$name}=*");
        $_ENV[$name] = '*';
        $_SERVER[$name] = '*';

        try {
            $config = require base_path('modules/Core/Config/trustedproxy.php');
        } finally {
            $oldPutenv === false ? putenv($name) : putenv("{$name}={$oldPutenv}");

            if ($hadEnv) {
                $_ENV[$name] = $oldEnv;
            } else {
                unset($_ENV[$name]);
            }

            if ($hadServer) {
                $_SERVER[$name] = $oldServer;
            } else {
                unset($_SERVER[$name]);
            }
        }

        expect($config['proxies'])->toBeNull();
    });
});
