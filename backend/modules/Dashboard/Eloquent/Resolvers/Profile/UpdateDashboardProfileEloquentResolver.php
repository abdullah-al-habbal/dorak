<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

final class UpdateDashboardProfileEloquentResolver
{
    public function resolve(AdminModel|BranchModel|BarberModel|ClientModel $model, string $displayName): AdminModel|BranchModel|BarberModel|ClientModel
    {
        $model->setTranslation('name', (string) app()->getLocale(), $displayName);
        $model->save();

        return $model->fresh();
    }
}
