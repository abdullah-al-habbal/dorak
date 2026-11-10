<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Services\BarberReviewService;
use Modules\Core\Http\Actions\BaseApiAction;

final class ApproveBarberAction extends BaseApiAction
{
    public function __construct(private readonly BarberReviewService $reviews) {}

    public function __invoke(Request $request, string $barber): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BarberReviewConstants::REVIEW_ABILITY);

        return $this->ok(
            data: new BarberReviewResource($this->reviews->approve($barber)),
            message: __('barber::messages.review_approved'),
        );
    }
}
