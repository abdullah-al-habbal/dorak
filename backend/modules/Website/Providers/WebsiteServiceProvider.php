<?php

declare(strict_types=1);

namespace Modules\Website\Providers;

use Illuminate\Support\Facades\View;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class WebsiteServiceProvider extends BaseModuleServiceProvider
{
    protected array $webMiddleware = [];

    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'website';
    }

    protected function afterBoot(): void
    {
        // Laravel renders status pages from the `errors` view namespace, so the website's pages are registered there.
        View::prependNamespace('errors', $this->moduleDir.'/Resources/views/errors');
    }
}
