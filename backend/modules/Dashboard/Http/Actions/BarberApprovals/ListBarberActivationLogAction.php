<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Http\Resources\Admin\AdminActivationLogResource;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListClientRelationRequest;

/** NS-08: every activation and deactivation of a barber, newest first. */
final class ListBarberActivationLogAction extends BaseApiAction
{
    public function __invoke(ListClientRelationRequest $request, string $barber): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BarberReviewConstants::REVIEW_ABILITY);
        BarberModel::query()->findOrFail($barber);

        $logs = ActivationLogModel::query()
            ->where('activable_type', ActivableTypeEnum::Barber)
            ->where('activable_id', $barber)
            ->with('admin')
            ->orderByDesc('activated_at')
            ->paginate($request->perPage());

        return $this->paginated($logs, AdminActivationLogResource::class);
    }
}
