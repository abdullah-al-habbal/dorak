<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Http\Resources\Client\ClientFaceProfileResource;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListFaceProfilePhotosAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = $request->user();
        abort_unless($client instanceof ClientModel, 401);

        $photos = ClientFaceProfileModel::query()
            ->where('client_id', (string) $client->id)
            ->oldest('uploaded_at')
            ->get();

        return $this->ok(data: ClientFaceProfileResource::collection($photos));
    }
}
