<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\VerifyDashboardEmailChangeHandler;
use Modules\Dashboard\Http\Requests\VerifyDashboardEmailChangeRequest;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Dashboard\Support\DashboardProfileData;

final class VerifyEmailChangeAction extends BaseApiAction
{
    public function __construct(private readonly VerifyDashboardEmailChangeHandler $handler) {}

    public function __invoke(VerifyDashboardEmailChangeRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var AdminModel|BranchModel|BarberModel|ClientModel $model */
        $model = $request->attributes->get('dashboard_model');
        if (! $this->handler->handle($model, $actor, $request->toCommand())) {
            return $this->unprocessable(__('dashboard::messages.invalid_confirmation_code'), ['code' => [__('dashboard::messages.invalid_confirmation_code')]]);
        }

        return $this->updated(DashboardProfileData::fromModel($model->fresh())->toArray());
    }
}
