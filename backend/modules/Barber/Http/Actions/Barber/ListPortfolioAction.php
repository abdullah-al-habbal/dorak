<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Http\Resources\Barber\BarberPortfolioPhotoResource;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListPortfolioAction extends BaseApiAction
{
    public function __invoke(): JsonResponse
    {
        $barber = Auth::guard('barber')->user();
        if (! $barber instanceof BarberModel) {
            return $this->unauthorized();
        }

        return $this->ok(BarberPortfolioPhotoResource::collection(
            $barber->portfolioPhotos()->orderBy('sort_order')->get(),
        ));
    }
}
