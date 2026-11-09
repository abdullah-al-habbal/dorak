<?php

declare(strict_types=1);

namespace Modules\Dashboard\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\Policies\BarberSchedulePolicy;
use Modules\Dashboard\Policies\BarberServiceOverridePolicy;
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

    protected function afterBoot(): void
    {
        Gate::policy(BarberScheduleModel::class, BarberSchedulePolicy::class);
        Gate::policy(BarberServiceOverrideModel::class, BarberServiceOverridePolicy::class);
        $this->registerPasswordResetLimiters();
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

    private function emailKey(Request $request): string
    {
        $actorType = $request->input('actor_type');
        $email = $request->input('email');

        return (is_string($actorType) ? $actorType : '').':'.hash('sha256', is_string($email) ? Str::lower(trim($email)) : '');
    }
}
