<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;

final class GetBrandFeaturesAction extends BaseApiAction
{
    public function __construct(private readonly BrandFeatures $features) {}

    public function __invoke(string $brand): JsonResponse
    {
        return $this->ok(data: $this->features->all(BrandModel::query()->findOrFail($brand)));
    }
}
