<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\UpdateDashboardPasswordHandler;
use Modules\Dashboard\Http\Requests\Business\UpdateDashboardPasswordRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdatePasswordAction extends BaseApiAction
{
    public function __construct(private readonly UpdateDashboardPasswordHandler $handler) {}

    public function __invoke(UpdateDashboardPasswordRequest $request): JsonResponse
    {
        /** @var AdminModel|BranchModel|BarberModel|ClientModel $model */
        $model = $request->attributes->get('dashboard_model');
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $token = $request->attributes->get('dashboard_token');
        $command = $request->toCommand($actor, $token instanceof PersonalAccessToken ? $token : null);

        if (! $this->handler->handle($model, $command)) {
            return $this->unprocessable(__('dashboard::messages.current_password_incorrect'), ['current_password' => [__('dashboard::messages.current_password_incorrect')]]);
        }

        return $this->updated(['password_updated' => true]);
    }
}
