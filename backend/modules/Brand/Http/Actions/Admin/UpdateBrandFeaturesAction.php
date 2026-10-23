<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Http\Requests\Admin\UpdateBrandFeaturesRequest;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;

/** H6: platform admins switch a brand's premium flags (Task 50). */
final class UpdateBrandFeaturesAction extends BaseApiAction
{
    public function __construct(private readonly BrandFeatures $features) {}

    public function __invoke(UpdateBrandFeaturesRequest $request, string $brand): JsonResponse
    {
        $model = BrandModel::query()->findOrFail($brand);
        $this->features->set($model, $request->flags());

        return $this->ok(data: $this->features->all($model), message: __('brand::messages.features_updated'));
    }
}
