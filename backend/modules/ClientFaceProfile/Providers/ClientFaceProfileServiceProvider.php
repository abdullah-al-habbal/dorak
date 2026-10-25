<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Gate;
use Modules\ClientFaceProfile\Console\Commands\PurgeFaceProfilePhotosCommand;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\ClientFaceProfile\Policies\ClientFaceProfilePolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class ClientFaceProfileServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'clientfaceprofile';
    }

    public function register(): void
    {
        $this->commands([
            PurgeFaceProfilePhotosCommand::class,
        ]);
    }

    protected function afterBoot(): void
    {
        Gate::policy(ClientFaceProfileModel::class, ClientFaceProfilePolicy::class);

        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('face-profile:purge')
                ->dailyAt('03:00')
                ->withoutOverlapping();
        });
    }
}
