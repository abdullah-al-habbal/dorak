<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Http\Resources\BarberResource;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Shared\ExploreBarbersHandler;
use Modules\Explore\Http\Requests\Shared\ExploreBarbersRequest;
use Modules\Explore\Support\ExploreSearchLog;

final class ExploreBarbersAction extends BaseApiAction
{
    public function __construct(
        private readonly ClientInteractionRecorder $interactions,
        private readonly ExploreBarbersHandler $handler,
    ) {}

    public function __invoke(ExploreBarbersRequest $request): JsonResponse
    {
        $query = $request->toQuery();
        $barbers = $this->handler->handle($query);
        ExploreSearchLog::record($this->interactions, $request, $barbers->total());

        return $this->paginated(paginator: $barbers, resourceClass: BarberResource::class);
    }
}
