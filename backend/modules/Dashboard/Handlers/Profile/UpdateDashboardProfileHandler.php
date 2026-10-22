<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\UpdateDashboardProfileCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\UpdateDashboardProfileEloquentResolver;

final class UpdateDashboardProfileHandler
{
    public function __construct(private readonly UpdateDashboardProfileEloquentResolver $resolver) {}

    public function handle(AdminModel|BranchModel|BarberModel|ClientModel $model, UpdateDashboardProfileCommand $command): AdminModel|BranchModel|BarberModel|ClientModel
    {
        return $this->resolver->resolve($model, $command->displayName);
    }
}
