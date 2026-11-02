<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Actions\Client;

use Illuminate\Support\Facades\Storage;
use Modules\ClientHistory\Models\ClientServiceHistoryMediaModel;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ShowHistoryMediaPhotoAction
{
    public function __invoke(string $media): StreamedResponse
    {
        $historyMedia = ClientServiceHistoryMediaModel::query()->findOrFail($media);

        abort_unless($historyMedia->image_path && Storage::disk('local')->exists($historyMedia->image_path), 404);

        return Storage::disk('local')->response($historyMedia->image_path, headers: [
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
