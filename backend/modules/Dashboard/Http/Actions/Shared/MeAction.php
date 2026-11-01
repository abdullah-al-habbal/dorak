<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

final class MeAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        /** @var AdminModel|BranchModel|BarberModel|ClientModel $model */
        $model = $request->attributes->get('dashboard_model');
        $token = $request->attributes->get('dashboard_token');

        return $this->success(data: [
            'id' => $actor->id,
            'actor_type' => $actor->actorType->value,
            'role' => $actor->role,
            'branch_id' => $actor->branchId,
            'brand_id' => $actor->brandId,
            'brand_ids' => $actor->brandIds,
            'display_name' => $this->displayName($model),
            'email' => $model->getAttribute('email'),
            'permissions' => array_values((array) ($token?->abilities ?? [])),
        ]);
    }

    private function displayName(AdminModel|BranchModel|BarberModel|ClientModel $model): ?string
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
