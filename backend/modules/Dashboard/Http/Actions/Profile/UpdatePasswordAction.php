<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\UpdateDashboardPasswordHandler;
use Modules\Dashboard\Http\Requests\UpdateDashboardPasswordRequest;

final class UpdatePasswordAction extends BaseApiAction
{
    public function __construct(private readonly UpdateDashboardPasswordHandler $handler) {}

    public function __invoke(UpdateDashboardPasswordRequest $request): JsonResponse
    {
        /** @var AdminModel|BranchModel|BarberModel $model */
        $model = $request->attributes->get('dashboard_model');
        if (! $this->handler->handle($model, $request->toCommand())) {
            return $this->unprocessable('Current password is incorrect.', ['current_password' => ['Current password is incorrect.']]);
        }

        return $this->updated(['password_updated' => true]);
    }
}
