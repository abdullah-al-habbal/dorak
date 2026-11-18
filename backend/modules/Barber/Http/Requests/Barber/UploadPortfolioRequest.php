<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Barber\CQRS\Command\Barber\UploadPortfolioCommand;
use Modules\Core\Constants\UploadConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class UploadPortfolioRequest extends BaseApiFormRequest
{
    private static function dimensionsRule(): string
    {
        $side = UploadConstants::UPLOAD_PHOTO_MAX_SIDE;

        return "dimensions:max_width={$side},max_height={$side}";
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:'.app(SettingsService::class)->int(SettingKey::UploadPortfolioMaxKb), self::dimensionsRule()],
        ];
    }

    public function toCommand(): UploadPortfolioCommand
    {
        return new UploadPortfolioCommand(
            barberId: (string) $this->user()->id,
            photo: $this->file('photo'),
        );
    }
}
