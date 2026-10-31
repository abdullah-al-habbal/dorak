<?php

declare(strict_types=1);

namespace Modules\Settings\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Settings\Models\PlatformSettingModel;
use Modules\Settings\Policies\PlatformSettingPolicy;

final class SettingsServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'settings';
    }

    protected function afterBoot(): void
    {
        Gate::policy(PlatformSettingModel::class, PlatformSettingPolicy::class);
    }
}
