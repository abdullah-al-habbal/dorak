<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;
use Modules\ServiceCatalog\Policies\ServiceCatalogCategoryPolicy;
use Modules\ServiceCatalog\Policies\ServiceCatalogItemPolicy;
use Modules\ServiceCatalog\Policies\ServiceCatalogItemTagPolicy;

final class ServiceCatalogServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'servicecatalog';
    }

    protected function afterBoot(): void
    {
        Gate::policy(ServiceCatalogItemModel::class, ServiceCatalogItemPolicy::class);
        Gate::policy(ServiceCatalogCategoryModel::class, ServiceCatalogCategoryPolicy::class);
        Gate::policy(ServiceCatalogItemTagModel::class, ServiceCatalogItemTagPolicy::class);
    }
}
