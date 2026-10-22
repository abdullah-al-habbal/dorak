<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Client\CQRS\Query\Client\GetProfileQuery;
use Modules\Client\Handlers\Client\GetProfileHandler;
use Modules\Core\Http\Actions\BaseApiAction;

final class GetProfileAction extends BaseApiAction
{
    public function __construct(
        private readonly GetProfileHandler $handler,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $client = $this->handler->handle(new GetProfileQuery(
            clientId: (string) $request->user()->getAuthIdentifier(),
        ));

        return $this->ok(data: $client->authPayload());
    }
}
