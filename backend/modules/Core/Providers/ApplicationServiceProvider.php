<?php

declare(strict_types=1);

namespace Modules\Core\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Models\NotificationDeliveryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class ApplicationServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'core';
    }

    public function register(): void
    {
        // When config is cached, the custom config keys are already baked into
        // bootstrap/cache/config.php (loadAppConfig ran during `config:cache`).
        // Re-requiring the files here would call env() — which returns null once
        // config is cached — and trigger TypeErrors / null-value config.
        if ($this->app->configurationIsCached()) {
            return;
        }

        $this->loadAppConfig();
    }

    protected function loadRoutes(): void {}

    protected function afterBoot(): void
    {
        $this->registerMorphMap();
        $this->registerFactoryResolution();
        $this->loadAppRoutes();
        Broadcast::routes(['prefix' => 'api/v1', 'middleware' => ['api', 'auth:admin_api,branch_api,barber,client']]);
        require __DIR__.'/../Routes/channels.php';
        $this->scheduleNotificationDeliveryPruning();
    }

    private function scheduleNotificationDeliveryPruning(): void
    {
        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('model:prune', ['--model' => [NotificationDeliveryModel::class]])
                ->dailyAt('03:00')
                ->withoutOverlapping();
        });
    }

    private function registerMorphMap(): void
    {
        Relation::enforceMorphMap([
            'admin' => AdminModel::class,
            'brand' => BrandModel::class,
            'branch' => BranchModel::class,
            'barber' => BarberModel::class,
            'client' => ClientModel::class,
            'catalog_item' => ServiceCatalogItemModel::class,
            'catalog_category' => ServiceCatalogCategoryModel::class,
            // Keep existing rows that were persisted before aliases were
            // enforced readable while all new writes use the stable aliases.
            AdminModel::class => AdminModel::class,
            BrandModel::class => BrandModel::class,
            BranchModel::class => BranchModel::class,
            BarberModel::class => BarberModel::class,
            ClientModel::class => ClientModel::class,
        ]);
    }

    private function registerFactoryResolution(): void
    {
        Factory::guessFactoryNamesUsing(function (string $modelName): string {
            return preg_replace(
                '/^Modules\\\\([^\\\\]+)\\\\Models\\\\(.+)Model$/',
                'Modules\\\\$1\\\\Database\\\\Factories\\\\$2Factory',
                $modelName
            );
        });
    }

    private function loadAppRoutes(): void
    {
        Route::prefix('api')
            ->middleware('api')
            ->group(__DIR__.'/../Routes/Api/V1/api_v1_routes.php');
    }

    private function loadAppConfig(): void
    {
        $config = $this->app->make(ConfigRepository::class);
        $path = __DIR__.'/../Config';

        foreach (glob($path.'/*.php') as $file) {
            $key = basename($file, '.php');
            $values = require $file;

            // The framework injects `app.providers` from bootstrap/providers.php.
            // Never let the file-defined config clobber it — replacing it breaks
            // provider registration after `config:cache` (all framework providers
            // silently vanish on the next boot).
            if ($key === 'app' && $config->has('app.providers')) {
                $values['providers'] = $config->get('app.providers');
            }

            $config->set($key, $values);
        }
    }
}
