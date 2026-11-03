<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Subscription\Http\Resources\Owner\OwnerBrandSubscriptionResource;
use Modules\Subscription\Models\BrandSubscriptionModel;

/** The current (latest) subscription of each brand the owner owns; brands without one are omitted (Gap G4). */
final class ListOwnerSubscriptionsAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        $subscriptions = BrandSubscriptionModel::query()
            ->whereIn('brand_id', $actor->scopedBrandIds() ?? [])
            ->with(['brand', 'plan.features'])
            ->latest()
            ->get()
            ->unique('brand_id')
            ->values();

        return $this->success(OwnerBrandSubscriptionResource::collection($subscriptions)->resolve($request));
    }
}
