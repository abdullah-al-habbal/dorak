<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ShowBarberApprovalAction extends BaseApiAction
{
    public function __invoke(Request $request, string $barber): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BarberReviewConstants::REVIEW_ABILITY);
        $model = BarberModel::query()->where('has_login', true)->with('portfolioPhotos')->findOrFail($barber);

        return $this->ok(new BarberReviewResource($model));
    }
}
