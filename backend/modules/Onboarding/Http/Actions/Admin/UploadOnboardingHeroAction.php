<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Onboarding\Constants\OnboardingMediaConstants;
use Modules\Onboarding\Http\Requests\Admin\UploadOnboardingHeroRequest;
use Modules\Onboarding\Http\Resources\Admin\AdminOnboardingConfigResource;
use Modules\Onboarding\Models\OnboardingConfigurationModel;

/** FT-13: replaces the hero of one onboarding screen. The previous file is deleted only if an earlier upload made it. */
final class UploadOnboardingHeroAction extends BaseApiAction
{
    public function __invoke(UploadOnboardingHeroRequest $request, string $config): JsonResponse
    {
        $model = OnboardingConfigurationModel::query()->findOrFail($config);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $previous = $model->hero_image_path;
        $path = $request->file('file')->store(OnboardingMediaConstants::ONBOARDING_MEDIA_DIRECTORY, 'public');
        $model->update(['hero_image_path' => $path]);

        if (Str::startsWith($previous, OnboardingMediaConstants::ONBOARDING_MEDIA_DIRECTORY.'/')) {
            Storage::disk('public')->delete($previous);
        }

        return $this->updated(data: new AdminOnboardingConfigResource($model->refresh()), message: __('onboarding::onboarding.config_saved'));
    }
}
