<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Http\Requests\Owner\ListOwnerPayoutsRequest;
use Modules\Payout\Http\Resources\Owner\OwnerPayoutResource;
use Modules\Payout\Models\PayoutModel;

/** Read-only payouts of the owner's own brands; drafts are internal and never listed (Gap G4). */
final class ListOwnerPayoutsAction extends BaseApiAction
{
    public function __invoke(ListOwnerPayoutsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');

        $payouts = PayoutModel::query()
            ->with('brand')
            ->whereIn('brand_id', $actor->scopedBrandIds() ?? [])
            ->where('status', '!=', PayoutStatus::Draft)
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($request->perPage());

        return $this->paginated($payouts, OwnerPayoutResource::class);
    }
}
