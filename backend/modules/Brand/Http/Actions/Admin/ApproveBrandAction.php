<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** G2: a platform admin approves a pending brand. Approving an active brand is a no-op. */
final class ApproveBrandAction extends BaseApiAction
{
    public function __invoke(string $brand): JsonResponse
    {
        $model = BrandModel::query()->findOrFail($brand);
        $model->update(['status' => BrandStatusEnum::Active]);

        return $this->ok(
            data: new BrandResource($model->load(['owner', 'baseCurrency'])->loadCount('branches')),
            message: __('brand::messages.approved'),
        );
    }
}
