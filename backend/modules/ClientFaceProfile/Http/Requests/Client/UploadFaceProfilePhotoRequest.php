<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Requests\Client;

use Modules\Core\Constants\UploadConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class UploadFaceProfilePhotoRequest extends BaseApiFormRequest
{
    private static function dimensionsRule(): string
    {
        $side = UploadConstants::UPLOAD_PHOTO_MAX_SIDE;

        return "dimensions:max_width={$side},max_height={$side}";
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:'.app(SettingsService::class)->int(SettingKey::UploadFacePhotoMaxKb), self::dimensionsRule()],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}
