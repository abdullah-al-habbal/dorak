<?php

declare(strict_types=1);

namespace Modules\Onboarding\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Onboarding\Models\OnboardingConfigurationModel;
use Modules\Onboarding\Policies\OnboardingConfigurationPolicy;

final class OnboardingServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'onboarding';
    }

    protected function afterBoot(): void
    {
        Gate::policy(OnboardingConfigurationModel::class, OnboardingConfigurationPolicy::class);
    }
}
