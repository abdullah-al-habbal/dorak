<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\ClientFaceProfile\Handlers\SetPrimaryFaceProfilePhotoHandler;
use Modules\ClientFaceProfile\Http\Requests\Client\SetPrimaryFaceProfilePhotoRequest;
use Modules\ClientFaceProfile\Http\Resources\ClientFaceProfileResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class SetPrimaryFaceProfilePhotoAction extends BaseApiAction
{
    public function __construct(
        private readonly SetPrimaryFaceProfilePhotoHandler $handler,
    ) {}

    public function __invoke(SetPrimaryFaceProfilePhotoRequest $request, string $photo): JsonResponse
    {
        $profile = $this->handler->handle($request->toCommand($photo));

        return $this->updated(data: new ClientFaceProfileResource($profile));
    }
}
