<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Shared\ExploreSearchHandler;
use Modules\Explore\Http\Requests\Shared\ExploreSearchRequest;
use Modules\Explore\Http\Resources\Shared\ExploreSearchItemResource;

final class ExploreSearchAction extends BaseApiAction
{
    public function __construct(
        private readonly ExploreSearchHandler $handler,
    ) {}

    public function __invoke(ExploreSearchRequest $request): JsonResponse
    {
        return $this->paginated(
            paginator: $this->handler->handle($request->toQuery()),
            resourceClass: ExploreSearchItemResource::class,
        );
    }
}
