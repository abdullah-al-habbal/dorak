<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\UpdateDashboardProfileHandler;
use Modules\Dashboard\Http\Requests\Business\UpdateDashboardProfileRequest;
use Modules\Dashboard\Support\DashboardProfileData;

final class UpdateProfileAction extends BaseApiAction
{
    public function __construct(private readonly UpdateDashboardProfileHandler $handler) {}

    public function __invoke(UpdateDashboardProfileRequest $request): JsonResponse
    {
        /** @var AdminModel|BranchModel|BarberModel|ClientModel $model */
        $model = $request->attributes->get('dashboard_model');
        $profile = $this->handler->handle($model, $request->toCommand());

        return $this->updated(DashboardProfileData::fromModel($profile)->toArray());
    }
}
