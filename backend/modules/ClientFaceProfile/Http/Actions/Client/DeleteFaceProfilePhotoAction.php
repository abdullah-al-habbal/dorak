<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\ClientFaceProfile\Handlers\DeleteFaceProfilePhotoHandler;
use Modules\ClientFaceProfile\Http\Requests\Client\DeleteFaceProfilePhotoRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class DeleteFaceProfilePhotoAction extends BaseApiAction
{
    public function __construct(
        private readonly DeleteFaceProfilePhotoHandler $handler,
    ) {}

    public function __invoke(DeleteFaceProfilePhotoRequest $request, string $photo): JsonResponse
    {
        $this->handler->handle($request->toCommand($photo));

        return $this->deleted();
    }
}
