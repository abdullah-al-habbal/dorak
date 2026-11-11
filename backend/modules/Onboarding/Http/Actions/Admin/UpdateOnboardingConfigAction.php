<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Onboarding\Http\Requests\Admin\UpdateOnboardingConfigRequest;
use Modules\Onboarding\Http\Resources\Admin\AdminOnboardingConfigResource;
use Modules\Onboarding\Models\OnboardingConfigurationModel;

final class UpdateOnboardingConfigAction extends BaseApiAction
{
    public function __invoke(UpdateOnboardingConfigRequest $request, string $config): JsonResponse
    {
        $model = OnboardingConfigurationModel::query()->findOrFail($config);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminOnboardingConfigResource($model->refresh()), message: __('onboarding::onboarding.config_saved'));
    }
}
