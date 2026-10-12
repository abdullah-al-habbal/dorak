<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Services;

use Illuminate\Support\Facades\URL;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class FaceProfilePhotoUrl
{
    public static function for(ClientFaceProfileModel $profile): string
    {
        return self::forId($profile->id);
    }

    public static function forId(string $profileId): string
    {
        return URL::temporarySignedRoute(
            'api.v1.client.face-profile.photo',
            now()->addMinutes(15),
            ['profile' => $profileId],
        );
    }
}
