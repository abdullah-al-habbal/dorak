<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Push;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;
use Modules\Core\Constants\DeviceTokenConstants;
use Modules\Core\CQRS\Command\Shared\RegisterDeviceTokenCommand;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Enums\Locale;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/**
 * Registers a browser (web push) token for the signed-in dashboard account. The platform is always
 * `web` and the token is not tied to one API token, because dashboard access tokens rotate on refresh.
 */
final class RegisterDashboardPushTokenRequest extends BaseApiFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
            'locale' => ['nullable', Rule::enum(Locale::class)],
            'app_version' => ['nullable', 'string', 'max:'.DeviceTokenConstants::DEVICE_TOKEN_APP_VERSION_MAX_LENGTH],
        ];
    }

    public function account(): Model
    {
        $account = $this->attributes->get('dashboard_model');
        abort_unless($account instanceof Model, 401);

        return $account;
    }

    public function toCommand(): RegisterDeviceTokenCommand
    {
        $locale = $this->input('locale');
        $appVersion = $this->input('app_version');

        return new RegisterDeviceTokenCommand(
            token: $this->string('token')->toString(),
            platform: DevicePlatformEnum::Web,
            locale: is_string($locale) ? $locale : null,
            appVersion: is_string($appVersion) ? $appVersion : null,
            accessTokenId: null,
        );
    }
}
