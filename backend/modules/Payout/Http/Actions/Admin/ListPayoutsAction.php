<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payout\Http\Requests\Admin\ListPayoutsRequest;
use Modules\Payout\Http\Resources\Admin\PayoutResource;
use Modules\Payout\Models\PayoutModel;

final class ListPayoutsAction extends BaseApiAction
{
    public function __invoke(ListPayoutsRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', PayoutModel::class);

        $payouts = PayoutModel::query()
            ->with(['brand', 'currency'])
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->when($request->query('brand_id'), fn ($query, $brandId) => $query->where('brand_id', $brandId))
            ->latest()
            ->paginate($request->perPage());

        return $this->paginated($payouts, PayoutResource::class);
    }
}
