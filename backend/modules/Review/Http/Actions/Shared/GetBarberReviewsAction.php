<?php

declare(strict_types=1);

namespace Modules\Review\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Review\Handlers\Shared\GetBarberReviewsHandler;
use Modules\Review\Http\Requests\Shared\GetBarberReviewsRequest;
use Modules\Review\Http\Resources\Shared\ReviewResource;

final class GetBarberReviewsAction extends BaseApiAction
{
    public function __construct(
        private readonly GetBarberReviewsHandler $handler,
    ) {}

    public function __invoke(string $barber, GetBarberReviewsRequest $request): JsonResponse
    {
        return $this->paginated(
            paginator: $this->handler->handle($request->toQuery()),
            resourceClass: ReviewResource::class,
        );
    }
}
