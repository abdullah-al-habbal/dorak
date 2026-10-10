<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class MeAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var AdminModel|BranchModel|BarberModel $model */
        $model = $request->attributes->get('dashboard_model');
        $token = $request->attributes->get('dashboard_token');

        return $this->success(data: [
            'id' => $actor->id,
            'actor_type' => $actor->actorType,
            'role' => $actor->role,
            'branch_id' => $actor->branchId,
            'display_name' => $this->displayName($model),
            'email' => $model->getAttribute('email'),
            'permissions' => array_values((array) ($token?->abilities ?? [])),
        ]);
    }

    private function displayName(AdminModel|BranchModel|BarberModel $model): ?string
    {
        $name = $model->getAttribute('name');

        if (is_string($name)) {
            return $name;
        }

        if (is_array($name)) {
            $locale = (string) app()->getLocale();
            $fallback = $name[$locale] ?? reset($name);

            return is_string($fallback) ? $fallback : null;
        }

        return null;
    }
}
