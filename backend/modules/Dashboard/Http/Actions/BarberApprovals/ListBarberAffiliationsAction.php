<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Http\Resources\Admin\AdminAffiliationResource;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** NS-08: the branches and brands a barber is, or was, affiliated with. */
final class ListBarberAffiliationsAction extends BaseApiAction
{
    public function __invoke(Request $request, string $barber): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BarberReviewConstants::REVIEW_ABILITY);
        BarberModel::query()->findOrFail($barber);

        $affiliations = BarberAffiliationModel::query()
            ->where('barber_id', $barber)
            ->with('affiliable')
            ->orderByDesc('created_at')
            ->get();

        return $this->ok(data: AdminAffiliationResource::collection($affiliations));
    }
}
