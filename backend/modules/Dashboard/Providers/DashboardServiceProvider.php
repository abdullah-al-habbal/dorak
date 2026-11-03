<?php

declare(strict_types=1);

namespace Modules\Dashboard\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
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
        Gate::policy(BarberServiceOverrideModel::class, BarberServiceOverridePolicy::class);
    }
}
