<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\ClientHistory\Observers\BookingCompletedObserver;
use Modules\ClientHistory\Observers\ClientDeletedObserver;
use Modules\ClientHistory\Policies\ClientServiceHistoryPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class ClientHistoryServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'clienthistory';
    }

    protected function afterBoot(): void
    {
        Gate::policy(ClientServiceHistoryModel::class, ClientServiceHistoryPolicy::class);
        BookingModel::observe(BookingCompletedObserver::class);
        ClientModel::observe(ClientDeletedObserver::class);
    }
}
