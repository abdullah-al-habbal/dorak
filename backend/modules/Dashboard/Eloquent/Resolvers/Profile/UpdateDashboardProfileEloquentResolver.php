<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Profile;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

final class UpdateDashboardProfileEloquentResolver
{
    public function resolve(AdminModel|BranchModel|BarberModel $model, string $displayName): AdminModel|BranchModel|BarberModel
    {
        $model->setTranslation('name', (string) app()->getLocale(), $displayName);
        $model->save();

        return $model->fresh();
    }
}
