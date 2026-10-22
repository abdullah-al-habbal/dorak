<?php

declare(strict_types=1);

namespace Modules\Review\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Review\Console\Commands\ReleaseExpiredReviewDisputesCommand;

final class ReviewServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'review';
    }

    public function register(): void
    {
        $this->commands([
            ReleaseExpiredReviewDisputesCommand::class,
        ]);
    }

    protected function afterBoot(): void
    {
        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('reviews:release-expired-disputes')
                ->hourly()
                ->withoutOverlapping();
        });
    }
}
