<?php

declare(strict_types=1);

namespace Modules\Marketing\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\SectionModel;
use Modules\Marketing\Models\TestimonialModel;
use Modules\Marketing\Policies\MarketingContentPolicy;

final class MarketingServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'marketing';
    }

    protected function afterBoot(): void
    {
        foreach ([MarketingPageModel::class, SectionModel::class, TestimonialModel::class] as $model) {
            Gate::policy($model, MarketingContentPolicy::class);
        }
    }
}
