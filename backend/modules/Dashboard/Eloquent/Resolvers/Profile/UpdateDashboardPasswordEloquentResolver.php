<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

final class UpdateDashboardPasswordEloquentResolver
{
    public function resolve(AdminModel|BranchModel|BarberModel|ClientModel $model, string $password): void
    {
        $model->forceFill(['password' => $password])->save();
    }
}
