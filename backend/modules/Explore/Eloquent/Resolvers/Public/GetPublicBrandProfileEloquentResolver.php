<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Public;

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Http\Resources\Public\PublicBrandProfileResource;

final class GetPublicBrandProfileEloquentResolver
{
    /** An active brand by slug (404 otherwise), listing only its discoverable branches. */
    public function resolve(GetPublicProfileQuery $query): PublicBrandProfileResource
    {
        $brand = BrandModel::active()->where('slug', $query->slug)->firstOrFail();
        $brand->setRelation('branches', BranchModel::discoverable()->where('brand_id', $brand->getKey())->orderBy('slug')->get());

        return new PublicBrandProfileResource($brand);
    }
}
