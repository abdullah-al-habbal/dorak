<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Onboarding\Http\Resources\Admin\AdminOnboardingConfigResource;
use Modules\Onboarding\Models\OnboardingConfigurationModel;

final class ListOnboardingConfigsAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', OnboardingConfigurationModel::class);

        $configs = OnboardingConfigurationModel::query()->orderBy('locale')->orderBy('sort_order')->orderBy('season')->get();

        return $this->ok(data: AdminOnboardingConfigResource::collection($configs));
    }
}
