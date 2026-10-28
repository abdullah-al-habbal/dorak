<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Subscription\Models\SubscriptionPlanModel;

/** The flags a plan may map to — the single source is `BrandFeatures`. */
final class ListPlanFeatureKeysAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', SubscriptionPlanModel::class);

        return $this->ok(data: BrandFeatures::keys());
    }
}
