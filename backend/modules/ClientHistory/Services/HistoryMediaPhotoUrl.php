<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Services;

use Illuminate\Support\Facades\URL;
use Modules\ClientHistory\Models\ClientServiceHistoryMediaModel;

final class HistoryMediaPhotoUrl
{
    public static function for(ClientServiceHistoryMediaModel $media): ?string
    {
        if ($media->image_path === null) {
            return null;
        }

        return URL::temporarySignedRoute(
            'api.v1.client.history.media.photo',
            now()->addMinutes(15),
            ['media' => $media->id],
        );
    }
}
