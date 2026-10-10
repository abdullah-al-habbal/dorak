<?php

declare(strict_types=1);

namespace Modules\Brand\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Policies\BrandPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BrandServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'brand';
    }

    protected function afterBoot(): void
    {
        Gate::policy(BrandModel::class, BrandPolicy::class);
    }
}
