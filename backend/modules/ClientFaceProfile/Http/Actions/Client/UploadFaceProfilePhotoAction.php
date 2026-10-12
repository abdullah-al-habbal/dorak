<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\CQRS\Command\UploadFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Handlers\UploadFaceProfilePhotoHandler;
use Modules\ClientFaceProfile\Http\Requests\Client\UploadFaceProfilePhotoRequest;
use Modules\ClientFaceProfile\Services\FaceProfilePhotoUrl;
use Modules\Core\Http\Actions\BaseApiAction;
use RuntimeException;

final class UploadFaceProfilePhotoAction extends BaseApiAction
{
    public function __construct(
        private readonly UploadFaceProfilePhotoHandler $handler,
    ) {}

    public function __invoke(UploadFaceProfilePhotoRequest $request): JsonResponse
    {
        $file = $request->file('photo');
        $client = $request->user();
        abort_unless($client instanceof ClientModel, 401);
        $clientId = (string) $client->id;
        $path = $file->store("face-profiles/{$clientId}", 'local');
        if ($path === false) {
            throw new RuntimeException('Face photo could not be stored privately.');
        }
        $contents = $file->get();
        if ($contents === false) {
            throw new RuntimeException('Face photo could not be read.');
        }
        $imageHash = md5($contents);

        $command = new UploadFaceProfilePhotoCommand(
            clientId: $clientId,
            imagePath: $path,
            imageHash: $imageHash,
            isPrimary: $request->boolean('is_primary', false),
        );

        $profile = $this->handler->handle($command);

        return $this->created(data: [
            'id' => $profile->id,
            'image_url' => FaceProfilePhotoUrl::for($profile),
            'is_primary' => $profile->is_primary,
            'uploaded_at' => $profile->uploaded_at->toIso8601String(),
        ]);
    }
}
