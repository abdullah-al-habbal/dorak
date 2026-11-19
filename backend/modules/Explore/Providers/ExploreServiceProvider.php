<?php

declare(strict_types=1);

namespace Modules\Explore\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Explore\Constants\ExploreRateLimitConstants;

final class ExploreServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'explore';
    }

    protected function afterBoot(): void
    {
        RateLimiter::for(ExploreRateLimitConstants::EXPLORE_LIMITER, fn (Request $request): Limit => Limit::perMinute(ExploreRateLimitConstants::EXPLORE_PER_MINUTE)->by('explore:'.$request->ip()));
    }
}
