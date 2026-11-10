<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Brand\Http\Resources\Shared\BrandResource;
use Modules\Brand\Services\BrandReviewService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;

/** D8: the owner fixed a rejected brand and sends it for review again (at most three submissions). */
final class ResubmitBrandAction extends BaseApiAction
{
    public function __construct(private readonly BrandReviewService $reviews) {}

    public function __invoke(Request $request, string $brand): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        // Out-of-scope brands are indistinguishable from missing ones.
        abort_unless($actor->isBrandOwner() && $actor->canManageBrand($brand), 404);

        $updated = $this->reviews->resubmit($brand, $actor->id);

        return $this->ok(
            data: new BrandResource($updated->load(['owner', 'baseCurrency'])->loadCount('branches')),
            message: __('brand::messages.resubmitted'),
        );
    }
}
