<?php

declare(strict_types=1);

namespace Modules\JobPosting\Providers;

use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\JobPosting\Console\Commands\ResolveDuplicateApplicationsCommand;
use Modules\JobPosting\Console\Commands\VerifyUniqueApplicationIndexCommand;

final class JobPostingServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'jobposting';
    }

    public function register(): void
    {
        parent::register();

        $this->commands([ResolveDuplicateApplicationsCommand::class, VerifyUniqueApplicationIndexCommand::class]);
    }
}
