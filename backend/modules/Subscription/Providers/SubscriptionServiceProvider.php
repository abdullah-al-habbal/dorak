<?php

declare(strict_types=1);

namespace Modules\Subscription\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Subscription\Console\Commands\ExpirePastDueSubscriptionsCommand;
use Modules\Subscription\Models\BrandSubscriptionModel;
use Modules\Subscription\Models\SubscriptionPlanModel;
use Modules\Subscription\Policies\SubscriptionAdminPolicy;

final class SubscriptionServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'subscription';
    }

    public function register(): void
    {
        $this->commands([ExpirePastDueSubscriptionsCommand::class]);
    }

    protected function afterBoot(): void
    {
        Gate::policy(SubscriptionPlanModel::class, SubscriptionAdminPolicy::class);
        Gate::policy(BrandSubscriptionModel::class, SubscriptionAdminPolicy::class);

        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('subscriptions:expire-past-due')
                ->hourly()
                ->withoutOverlapping();
        });
    }
}
