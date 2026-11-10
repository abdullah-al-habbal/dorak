<?php

declare(strict_types=1);

namespace Modules\Ban\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Constants\BanConstants;
use Modules\Ban\Models\BanModel;
use Modules\Ban\Observers\BanObserver;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BanServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'ban';
    }

    protected function afterBoot(): void
    {
        BanModel::observe(BanObserver::class);
        Gate::define(BanConstants::MANAGE_CLIENTS_ABILITY, static fn (mixed $actor): bool => $actor instanceof AdminModel);
    }
}
