<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\BarberAffiliation\Policies\BarberAffiliationPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BarberAffiliationServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'barberaffiliation';
    }

    protected function afterBoot(): void
    {
        Gate::policy(BarberAffiliationModel::class, BarberAffiliationPolicy::class);
    }
}
