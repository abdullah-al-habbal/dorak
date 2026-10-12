<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Actions\Client;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ShowFaceProfilePhotoAction
{
    public function __invoke(string $profile): StreamedResponse
    {
        $faceProfile = ClientFaceProfileModel::query()->findOrFail($profile);
        $client = Auth::guard('client')->user();

        if ($client instanceof ClientModel) {
            abort_unless((string) $client->id === $faceProfile->client_id, 403);
        }

        abort_unless($faceProfile->image_path && Storage::disk('local')->exists($faceProfile->image_path), 404);

        return Storage::disk('local')->response($faceProfile->image_path, headers: [
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
