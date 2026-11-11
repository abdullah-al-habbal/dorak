<?php

declare(strict_types=1);

namespace Modules\Currency\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Policies\CurrencyPolicy;

final class CurrencyServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'currency';
    }

    protected function afterBoot(): void
    {
        Gate::policy(CurrencyModel::class, CurrencyPolicy::class);
    }
}
