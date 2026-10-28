<?php

declare(strict_types=1);

namespace Modules\Payment\Providers;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Payment\Models\PaymentGatewayModel;
use Modules\Payment\Policies\PaymentGatewayPolicy;

final class PaymentServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'payment';
    }

    protected function afterBoot(): void
    {
        Gate::policy(PaymentGatewayModel::class, PaymentGatewayPolicy::class);
    }
}
