<?php

declare(strict_types=1);

namespace Modules\Branch\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Policies\BranchPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BranchServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'branch';
    }

    protected function afterBoot(): void
    {
        Gate::policy(BranchModel::class, BranchPolicy::class);
    }
}
