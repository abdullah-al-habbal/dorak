<?php

declare(strict_types=1);

namespace Modules\Dashboard\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Dashboard\Console\Commands\PurgeUnverifiedSignupsCommand;
use Modules\Dashboard\Constants\DashboardBarberLookupConstants;
use Modules\Dashboard\Constants\DashboardLoginConstants;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;
use Modules\Dashboard\Policies\BarberSchedulePolicy;
use Modules\Dashboard\Policies\BarberServiceOverridePolicy;
use Modules\Dashboard\Policies\DashboardBookingPolicy;
use Modules\Dashboard\Policies\DashboardBranchPolicy;
use Modules\Dashboard\Policies\DashboardChairPolicy;
use Modules\Dashboard\Policies\DashboardReviewPolicy;
use Modules\Dashboard\Policies\DashboardServicePolicy;
use Modules\OfferedService\Models\BarberServiceOverrideModel;

final class DashboardServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'dashboard';
    }

    public function register(): void
    {
        parent::register();

        $this->commands([PurgeUnverifiedSignupsCommand::class]);
    }

    protected function afterBoot(): void
    {
        Gate::policy(BarberScheduleModel::class, BarberSchedulePolicy::class);
        Gate::policy(BarberServiceOverrideModel::class, BarberServiceOverridePolicy::class);
        foreach (['create', 'delete', 'update', 'updateHours'] as $ability) {
            Gate::define("dashboard.branch.{$ability}", [DashboardBranchPolicy::class, $ability]);
        }
        Gate::define('dashboard.service.write', [DashboardServicePolicy::class, 'write']);
        Gate::define('dashboard.review.file', [DashboardReviewPolicy::class, 'file']);
        Gate::define('dashboard.booking.createWalkIn', [DashboardBookingPolicy::class, 'createWalkIn']);
        Gate::define('dashboard.chair.create', [DashboardChairPolicy::class, 'create']);
        Gate::define('dashboard.chair.manage', [DashboardChairPolicy::class, 'manage']);
        $this->registerPasswordResetLimiters();
        $this->registerOwnerRegistrationLimiters();
        $this->registerBarberLookupLimiter();
        $this->registerLoginLimiters();

        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command(OwnerRegistrationConstants::PURGE_COMMAND)
                ->dailyAt(OwnerRegistrationConstants::PURGE_TIME)
                ->withoutOverlapping();
        });
    }

    /**
     * Reset requests count per IP and per email (unknown emails included, so the
     * limit reveals nothing); using a link counts per IP only. The IP is the
     * visitor's once TRUSTED_PROXIES lists the dashboard server.
     */
    private function registerPasswordResetLimiters(): void
    {
        RateLimiter::for(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_LIMITER, fn (Request $request): array => [
            Limit::perMinute(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_IP_PER_MINUTE)->by('ip:'.$request->ip()),
            Limit::perHour(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_FORGOT_PER_EMAIL_PER_HOUR)->by('email:'.$this->emailKey($request)),
        ]);

        RateLimiter::for(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_LIMITER, fn (Request $request): Limit => Limit::perMinute(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_PER_IP_PER_MINUTE)->by('ip:'.$request->ip()));
    }

    /**
     * Lookups reveal whether an exact email or phone belongs to a stylist, so they are budgeted per
     * signed-in account (falling back to the IP), not per IP: offices share one address.
     */
    private function registerBarberLookupLimiter(): void
    {
        RateLimiter::for(DashboardBarberLookupConstants::BARBER_LOOKUP_LIMITER, fn (Request $request): Limit => Limit::perMinute(DashboardBarberLookupConstants::BARBER_LOOKUP_PER_ACCOUNT_PER_MINUTE)->by('barber-lookup:'.$this->accountKey($request)));
    }

    /** Sign-in and owner brand creation take credentials, so each gets its own per-IP counter and configured budget. */
    private function registerLoginLimiters(): void
    {
        RateLimiter::for(DashboardLoginConstants::LOGIN_LIMITER, fn (Request $request): Limit => Limit::perMinute((int) config('dashboard.dashboard.login_attempts_per_minute'))->by('dashboard-login:'.$request->ip()));
        RateLimiter::for(DashboardLoginConstants::OWNER_BRAND_LIMITER, fn (Request $request): Limit => Limit::perMinute((int) config('dashboard.dashboard.owner_brand_attempts_per_minute'))->by('dashboard-owner-brand:'.$request->ip()));
    }

    /** Throttle middleware runs before the dashboard session middleware, so the account is read straight from the token's guards. */
    private function accountKey(Request $request): string
    {
        foreach (DashboardBarberLookupConstants::ACCOUNT_GUARDS as $guard) {
            $account = $request->user($guard);
            if ($account instanceof Model) {
                return $account->getMorphClass().':'.$account->getKey();
            }
        }

        return 'ip:'.$request->ip();
    }

    /** Sign-ups and resends share one budget per IP and per email; the verify step has its own, looser one. */
    private function registerOwnerRegistrationLimiters(): void
    {
        RateLimiter::for(OwnerRegistrationConstants::OWNER_REGISTER_LIMITER, fn (Request $request): array => [
            Limit::perMinute(OwnerRegistrationConstants::OWNER_REGISTER_PER_IP_PER_MINUTE)->by('owner-register-ip:'.$request->ip()),
            Limit::perHour(OwnerRegistrationConstants::OWNER_REGISTER_PER_EMAIL_PER_HOUR)->by('owner-register-email:'.$this->ownerEmailKey($request)),
        ]);

        RateLimiter::for(OwnerRegistrationConstants::OWNER_VERIFY_LIMITER, fn (Request $request): array => [
            Limit::perMinute(OwnerRegistrationConstants::OWNER_VERIFY_PER_IP_PER_MINUTE)->by('owner-verify-ip:'.$request->ip()),
            Limit::perHour(OwnerRegistrationConstants::OWNER_VERIFY_PER_EMAIL_PER_HOUR)->by('owner-verify-email:'.$this->ownerEmailKey($request)),
        ]);
    }

    /** The email may arrive as `owner.email` (sign-up) or `email` (resend, verify); case and spaces do not matter. */
    private function ownerEmailKey(Request $request): string
    {
        $email = $request->input('owner.email', $request->input('email'));

        return hash('sha256', is_string($email) ? Str::lower(trim($email)) : '');
    }

    private function emailKey(Request $request): string
    {
        $actorType = $request->input('actor_type');
        $email = $request->input('email');

        return (is_string($actorType) ? $actorType : '').':'.hash('sha256', is_string($email) ? Str::lower(trim($email)) : '');
    }
}
