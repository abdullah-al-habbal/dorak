<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Http\Resources\Client\ClientFaceProfileResource;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ShowFaceProfileAction extends BaseApiAction
{
    public function __invoke(Request $request, string $profile): JsonResponse
    {
        $client = $request->user();
        abort_unless($client instanceof ClientModel, 401);

        $faceProfile = ClientFaceProfileModel::query()
            ->where('client_id', (string) $client->id)
            ->findOrFail($profile);

        return $this->ok(data: new ClientFaceProfileResource($faceProfile));
    }
}
