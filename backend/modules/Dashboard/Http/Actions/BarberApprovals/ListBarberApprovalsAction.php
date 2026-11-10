<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListBarberApprovalsRequest;

/** NS-30: the admin review queue of self-registered barbers (every status; the dashboard opens on `pending`). */
final class ListBarberApprovalsAction extends BaseApiAction
{
    public function __invoke(ListBarberApprovalsRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BarberReviewConstants::REVIEW_ABILITY);
        $status = $request->status();
        $search = $request->search();

        $barbers = BarberModel::query()
            // Barbers created by a branch manager have no login and never enter the queue.
            ->where('has_login', true)
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $inner->where('name->en', 'like', $like)
                    ->orWhere('name->ar', 'like', $like)
                    ->orWhere('email', 'like', $like);
            }))
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($barbers, BarberReviewResource::class);
    }
}
