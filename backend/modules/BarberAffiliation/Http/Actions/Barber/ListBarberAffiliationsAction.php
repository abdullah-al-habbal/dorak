<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\BarberAffiliation\Http\Requests\Barber\ListBarberAffiliationsRequest;
use Modules\BarberAffiliation\Http\Resources\Barber\BarberAffiliationResource;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListBarberAffiliationsAction extends BaseApiAction
{
    public function __invoke(ListBarberAffiliationsRequest $request, string $barber): JsonResponse
    {
        $affiliations = BarberAffiliationModel::where('barber_id', $barber)
            ->with('affiliable')
            ->get();

        return $this->ok(
            data: BarberAffiliationResource::collection($affiliations),
        );
    }
}
