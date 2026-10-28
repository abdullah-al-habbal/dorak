<?php

declare(strict_types=1);

namespace Modules\Commission\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Booking\Models\BookingModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Commission\Models\CommissionRuleModel;
use Modules\Commission\Observers\BookingCompletedCommissionObserver;
use Modules\Commission\Policies\CommissionPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class CommissionServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'commission';
    }

    protected function afterBoot(): void
    {
        Gate::policy(CommissionRuleModel::class, CommissionPolicy::class);
        Gate::policy(CommissionEntryModel::class, CommissionPolicy::class);
        BookingModel::observe(BookingCompletedCommissionObserver::class);
    }
}
