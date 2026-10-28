<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Commission\Http\Requests\Admin\ListCommissionRequest;
use Modules\Commission\Http\Resources\Admin\CommissionEntryResource;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListCommissionEntriesAction extends BaseApiAction
{
    public function __invoke(ListCommissionRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', CommissionEntryModel::class);

        $entries = CommissionEntryModel::query()
            ->with('currency')
            ->when($request->query('brand_id'), fn ($query, $brandId) => $query->where('brand_id', $brandId))
            ->when($request->has('settled'), fn ($query) => $request->boolean('settled')
                ? $query->whereNotNull('payout_id')
                : $query->whereNull('payout_id'))
            ->latest()
            ->paginate($request->perPage());

        return $this->paginated($entries, CommissionEntryResource::class);
    }
}
