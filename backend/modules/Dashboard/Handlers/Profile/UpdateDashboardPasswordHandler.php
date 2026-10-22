<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\UpdateDashboardPasswordCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\UpdateDashboardPasswordEloquentResolver;

final class UpdateDashboardPasswordHandler
{
    public function __construct(private readonly UpdateDashboardPasswordEloquentResolver $resolver) {}

    public function handle(AdminModel|BranchModel|BarberModel|ClientModel $model, UpdateDashboardPasswordCommand $command): bool
    {
        if (! Hash::check($command->currentPassword, (string) $model->getAuthPassword())) {
            return false;
        }

        $this->resolver->resolve($model, $command->password);

        return true;
    }
}
