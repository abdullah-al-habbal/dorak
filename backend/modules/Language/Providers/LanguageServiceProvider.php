<?php

declare(strict_types=1);

namespace Modules\Language\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Language\Models\LanguageModel;
use Modules\Language\Policies\LanguagePolicy;

final class LanguageServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'language';
    }

    protected function afterBoot(): void
    {
        Gate::policy(LanguageModel::class, LanguagePolicy::class);
    }
}
