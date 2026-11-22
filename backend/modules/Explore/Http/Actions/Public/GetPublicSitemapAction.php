<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Public;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Public\GetPublicSitemapHandler;

final class GetPublicSitemapAction extends BaseApiAction
{
    public function __construct(
        private readonly GetPublicSitemapHandler $handler,
    ) {}

    public function __invoke(): JsonResponse
    {
        return $this->ok(data: $this->handler->handle());
    }
}
