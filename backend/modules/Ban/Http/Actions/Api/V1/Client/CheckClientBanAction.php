<?php

declare(strict_types=1);

namespace Modules\Ban\Http\Actions\Api\V1\Client;

use Illuminate\Http\JsonResponse;
use Modules\Ban\Handlers\Client\CheckClientBanHandler;
use Modules\Ban\Http\Requests\Client\CheckClientBanRequest;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class CheckClientBanAction extends BaseApiAction
{
    public function __construct(
        private readonly CheckClientBanHandler $handler,
    ) {}

    public function __invoke(CheckClientBanRequest $request, string $client): JsonResponse
    {
        $bans = $this->handler->handle($request->toQuery($client));

        $authenticatedClient = $request->user();

        if (! ($authenticatedClient instanceof ClientModel) || (string) $authenticatedClient->getAuthIdentifier() !== $client) {
            return $this->forbidden();
        }

        return $this->ok([
            'banned' => $bans->isNotEmpty(),
            'bans' => $bans,
        ]);
    }
}
