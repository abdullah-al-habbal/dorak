<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Requests\Client;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class UploadFaceProfilePhotoRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:'.app(SettingsService::class)->int(SettingKey::UploadFacePhotoMaxKb)],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}
