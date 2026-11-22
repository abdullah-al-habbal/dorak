<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Public;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Handlers\Public\GetPublicBrandProfileHandler;

final class GetPublicBrandProfileAction extends BaseApiAction
{
    public function __construct(
        private readonly GetPublicBrandProfileHandler $handler,
    ) {}

    public function __invoke(string $slug): JsonResponse
    {
        return $this->ok(data: $this->handler->handle(new GetPublicProfileQuery(slug: $slug)));
    }
}
