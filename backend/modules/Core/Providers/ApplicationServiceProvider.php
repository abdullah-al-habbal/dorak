<?php

declare(strict_types=1);

namespace Modules\Core\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Modules\Core\Constants\DatabaseSafetyConstants;
use Modules\Core\Constants\MorphMapConstants;
use Modules\Core\Contracts\SmsSender;
use Modules\Core\Models\NotificationDeliveryModel;
use Modules\Core\Services\Sms\SmsSenderFactory;

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
        $this->registerSmsSender();

        // When config is cached, the custom config keys are already baked into
        // bootstrap/cache/config.php (loadAppConfig ran during `config:cache`).
        // Re-requiring the files here would call env() — which returns null once
        // config is cached — and trigger TypeErrors / null-value config.
        if ($this->app->configurationIsCached()) {
            return;
        }

        $this->loadAppConfig();
    }

    private function registerSmsSender(): void
    {
        $this->app->bind(SmsSender::class, fn ($app): SmsSender => $app->make(SmsSenderFactory::class)->make());
    }

    protected function loadRoutes(): void {}

    protected function afterBoot(): void
    {
        $this->prohibitDestructiveDatabaseCommands();
        $this->registerMorphMap();
        $this->registerFactoryResolution();
        $this->loadAppRoutes();
        Broadcast::routes(['prefix' => 'api/v1', 'middleware' => ['api', 'auth:admin_api,branch_api,barber,client']]);
        require __DIR__.'/../Routes/channels.php';
        $this->scheduleNotificationDeliveryPruning();
    }

    /**
     * `migrate:fresh`, `migrate:refresh`, `migrate:reset` and `db:wipe` refuse to run in production AND whenever the
     * default connection is not a local database (remote host, or no host and no socket), whatever APP_ENV says.
     * `migrate:fresh` on a developer's own machine stays available.
     */
    private function prohibitDestructiveDatabaseCommands(): void
    {
        DB::prohibitDestructiveCommands($this->app->isProduction() || ! $this->defaultConnectionIsLocal());
    }

    private function defaultConnectionIsLocal(): bool
    {
        $config = (array) config('database.connections.'.config('database.default'), []);

        if ((string) ($config['unix_socket'] ?? '') !== '') {
            return true;
        }

        return in_array((string) ($config['host'] ?? ''), DatabaseSafetyConstants::DATABASE_SAFETY_LOCAL_HOSTS, true);
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
        $map = [];

        foreach (MorphMapConstants::MORPH_ALIAS_ENUMS as $enum) {
            foreach ($enum::cases() as $case) {
                $map[$case->value] = $case->modelClass();
            }
        }

        // Unmapped models raise ClassMorphViolationException instead of
        // silently persisting a fully-qualified class name.
        Relation::requireMorphMap();
        Relation::morphMap($map);
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
