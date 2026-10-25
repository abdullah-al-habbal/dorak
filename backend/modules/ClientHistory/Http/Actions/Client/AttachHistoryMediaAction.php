<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\ClientHistory\Handlers\AttachHistoryMediaHandler;
use Modules\ClientHistory\Http\Requests\Client\AttachHistoryMediaRequest;
use Modules\ClientHistory\Services\HistoryMediaPhotoUrl;
use Modules\Core\Http\Actions\BaseApiAction;
use RuntimeException;

final class AttachHistoryMediaAction extends BaseApiAction
{
    public function __construct(
        private readonly AttachHistoryMediaHandler $handler,
    ) {}

    public function __invoke(AttachHistoryMediaRequest $request, string $history): JsonResponse
    {
        $path = $request->file('photo')->store("history-media/{$history}", 'local');
        if ($path === false) {
            throw new RuntimeException('History photo could not be stored privately.');
        }

        $media = $this->handler->handle($request->toCommand($history, $path));

        return $this->created(data: [
            'id' => $media->id,
            'photo_url' => HistoryMediaPhotoUrl::for($media),
            'photo_type' => $media->photo_type->value,
            'uploaded_at' => $media->uploaded_at->toIso8601String(),
        ]);
    }
}
