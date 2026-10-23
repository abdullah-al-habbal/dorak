<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Shared\ExploreSearchHandler;
use Modules\Explore\Http\Requests\Shared\ExploreSearchRequest;
use Modules\Explore\Http\Resources\Shared\ExploreSearchItemResource;
use Modules\Explore\Support\ExploreSearchLog;

final class ExploreSearchAction extends BaseApiAction
{
    public function __construct(
        private readonly ClientInteractionRecorder $interactions,
        private readonly ExploreSearchHandler $handler,
    ) {}

    public function __invoke(ExploreSearchRequest $request): JsonResponse
    {
        $results = $this->handler->handle($request->toQuery());
        ExploreSearchLog::record($this->interactions, $request, $results->total());

        return $this->paginated(
            paginator: $results,
            resourceClass: ExploreSearchItemResource::class,
        );
    }
}
