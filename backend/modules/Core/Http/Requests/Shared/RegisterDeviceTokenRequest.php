<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\DeviceTokenConstants;
use Modules\Core\CQRS\Command\Shared\RegisterDeviceTokenCommand;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Enums\Locale;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RegisterDeviceTokenRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
            'platform_type' => ['required', Rule::enum(DevicePlatformEnum::class)],
            'locale' => ['nullable', Rule::enum(Locale::class)],
            'app_version' => ['nullable', 'string', 'max:'.DeviceTokenConstants::DEVICE_TOKEN_APP_VERSION_MAX_LENGTH],
        ];
    }

    public function toCommand(): RegisterDeviceTokenCommand
    {
        $locale = $this->input('locale');
        $appVersion = $this->input('app_version');
        $accessToken = $this->user()?->currentAccessToken();

        return new RegisterDeviceTokenCommand(
            token: $this->string('token')->toString(),
            platform: DevicePlatformEnum::from($this->string('platform_type')->toString()),
            locale: is_string($locale) ? $locale : null,
            appVersion: is_string($appVersion) ? $appVersion : null,
            accessTokenId: $accessToken?->getKey(),
        );
    }
}
