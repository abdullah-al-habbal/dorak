<?php

declare(strict_types=1);

namespace Modules\Payout\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Payout\Console\Commands\GeneratePayoutsCommand;
use Modules\Payout\Models\PayoutModel;
use Modules\Payout\Policies\PayoutPolicy;

final class PayoutServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'payout';
    }

    public function register(): void
    {
        $this->commands([GeneratePayoutsCommand::class]);
    }

    protected function afterBoot(): void
    {
        Gate::policy(PayoutModel::class, PayoutPolicy::class);
    }
}
