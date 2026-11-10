<?php

declare(strict_types=1);

namespace Modules\Admin\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Models\AdminModel;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class AdminServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'admin';
    }

    /** NS-04: any active platform admin manages the other admin accounts. */
    protected function afterBoot(): void
    {
        Gate::define(AdminUserConstants::MANAGE_ABILITY, static fn (mixed $actor): bool => $actor instanceof AdminModel && $actor->isActive());
    }
}
