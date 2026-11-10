<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Http\Requests\Admin\SuspendBrandRequest;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandReviewService;
use Modules\Core\Http\Actions\BaseApiAction;

final class SuspendBrandAction extends BaseApiAction
{
    public function __construct(private readonly BrandReviewService $reviews) {}

    public function __invoke(SuspendBrandRequest $request, string $brand): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize('review', BrandModel::query()->findOrFail($brand));
        $updated = $this->reviews->suspend($brand, (string) $admin->getKey(), $request->reason(), $request->cancelFutureBookings());

        return $this->ok(
            data: new BrandResource($updated->load(['owner', 'baseCurrency'])->loadCount('branches')),
            message: __('brand::messages.suspended'),
        );
    }
}
