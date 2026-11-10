<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandReviewService;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** G2: a platform admin approves a pending brand, under a row lock. Approving an active brand is a no-op. */
final class ApproveBrandAction extends BaseApiAction
{
    public function __construct(private readonly BrandReviewService $reviews) {}

    public function __invoke(Request $request, string $brand): JsonResponse
    {
        $model = BrandModel::query()->findOrFail($brand);
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize('approve', $model);
        $owner = $model->owner()->first();
        if (! $owner instanceof ClientModel || $owner->email_verified_at === null) {
            return $this->unprocessable(message: __('brand::messages.owner_unverified'));
        }

        $approved = $model->status === BrandStatusEnum::Active ? $model : $this->reviews->approve($brand, (string) $admin->getKey());

        return $this->ok(
            data: new BrandResource($approved->load(['owner', 'baseCurrency'])->loadCount('branches')),
            message: __('brand::messages.approved'),
        );
    }
}
