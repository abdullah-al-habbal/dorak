<?php

declare(strict_types=1);

namespace Modules\Barber\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BarberServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'barber';
    }

    /**
     * NS-30: only a platform admin reviews self-registered barbers. A named ability, not a policy,
     * because `BarberModel` already carries the branch activation policy.
     */
    protected function afterBoot(): void
    {
        Gate::define(BarberReviewConstants::REVIEW_ABILITY, static fn (mixed $actor): bool => $actor instanceof AdminModel);
    }
}
