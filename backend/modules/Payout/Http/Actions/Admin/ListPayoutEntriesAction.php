<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Commission\Http\Requests\Admin\ListCommissionRequest;
use Modules\Commission\Http\Resources\Admin\CommissionEntryResource;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Payout\Models\PayoutModel;

/** The lines of a payout: the commission entries settled by it, newest first. */
final class ListPayoutEntriesAction extends BaseApiAction
{
    public function __invoke(ListCommissionRequest $request, string $payout): JsonResponse
    {
        $model = PayoutModel::query()->findOrFail($payout);
        Gate::forUser($request->user('admin_api'))->authorize('view', $model);

        $entries = CommissionEntryModel::query()
            ->with('currency')
            ->where('payout_id', $model->getKey())
            ->latest()
            ->paginate($request->perPage());

        return $this->paginated($entries, CommissionEntryResource::class);
    }
}
