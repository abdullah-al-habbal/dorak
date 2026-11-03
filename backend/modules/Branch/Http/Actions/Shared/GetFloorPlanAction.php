<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Branch\Handlers\Shared\GetFloorPlanHandler;
use Modules\Branch\Http\Requests\Shared\GetFloorPlanRequest;
use Modules\Branch\Http\Resources\Shared\ChairResource;
use Modules\Branch\Support\FloorPlanLayout;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\OfferedService\Http\Resources\Shared\MenuServiceResource;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class GetFloorPlanAction extends BaseApiAction
{
    public function __construct(
        private readonly GetFloorPlanHandler $handler,
        private readonly EffectiveServiceTerms $serviceTerms,
    ) {}

    public function __invoke(GetFloorPlanRequest $request, string $branch): JsonResponse
    {
        $branchModel = $this->handler->handle($request->toQuery($branch));
        $brandId = $branchModel->getAttribute('brand_id') === null ? null : (string) $branchModel->getAttribute('brand_id');
        $this->serviceTerms->attach(
            $branchModel->chairs->flatMap(fn (ChairModel $chair) => $chair->barber?->services ?? []),
            $brandId,
        );

        return $this->ok([
            'branch_id' => $branchModel->id,
            'branch_name' => $branchModel->name,
            'floor_plan' => FloorPlanLayout::payload($branchModel),
            'chairs' => $branchModel->chairs->map(fn (ChairModel $chair): array => [
                ...ChairResource::make($chair)->resolve($request),
                // A seated barber brings their own menu; an empty chair uses the shop's (Task 48).
                'barber' => $chair->barber === null ? null : [
                    ...BarberResource::make($chair->barber)->resolve($request),
                    'services' => MenuServiceResource::collection($chair->barber->services)->resolve($request),
                ],
                'services_source' => $chair->barber === null ? 'branch' : 'barber',
            ])->values(),
            'branch_services' => MenuServiceResource::collection(
                OfferedServiceModel::query()
                    ->bookable()
                    ->offeredAtShop($branchModel->getAttribute('brand_id') === null ? null : (string) $branchModel->getAttribute('brand_id'))
                    ->orderBy('price_amount_minor')
                    ->get(),
            )->resolve($request),
        ]);
    }
}
