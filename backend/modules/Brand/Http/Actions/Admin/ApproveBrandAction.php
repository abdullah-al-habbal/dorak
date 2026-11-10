<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Services\OwnerBrandMailer;

/** G2: a platform admin approves a pending brand. Approving an active brand is a no-op. */
final class ApproveBrandAction extends BaseApiAction
{
    public function __construct(private readonly OwnerBrandMailer $mailer) {}

    public function __invoke(Request $request, string $brand): JsonResponse
    {
        $model = BrandModel::query()->findOrFail($brand);
        Gate::forUser($request->user('admin_api'))->authorize('approve', $model);
        $owner = $model->owner()->first();
        if (! $owner instanceof ClientModel || $owner->email_verified_at === null) {
            return $this->unprocessable(message: __('brand::messages.owner_unverified'));
        }

        $wasPending = ! $model->isActive();
        $model->update(['status' => BrandStatusEnum::Active]);
        if ($wasPending) {
            $this->mailer->approved($model);
        }

        return $this->ok(
            data: new BrandResource($model->load(['owner', 'baseCurrency'])->loadCount('branches')),
            message: __('brand::messages.approved'),
        );
    }
}
