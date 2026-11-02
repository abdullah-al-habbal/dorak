<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ShowBrandAction extends BaseApiAction
{
    public function __invoke(Request $request, string $brand): JsonResponse
    {
        $brand = BrandModel::with(['owner', 'baseCurrency', 'branches'])->findOrFail($brand);
        $brand->setRelation('branches', $brand->branches
            ->filter(fn (BranchModel $branch): bool => $branch->isEnabled && ! $branch->bans()
                ->where('banned_at', '<=', now())
                ->where(fn (Builder $query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->exists())
            ->values());

        return $this->ok(data: new BrandResource($brand));
    }
}
