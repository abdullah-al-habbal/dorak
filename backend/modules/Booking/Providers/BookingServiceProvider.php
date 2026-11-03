<?php

declare(strict_types=1);

namespace Modules\Booking\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Policies\BookingPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BookingServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'booking';
    }

    protected function afterBoot(): void
    {
        Gate::policy(BookingModel::class, BookingPolicy::class);
    }
}
