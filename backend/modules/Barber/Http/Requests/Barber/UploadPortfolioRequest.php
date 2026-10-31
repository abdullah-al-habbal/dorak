<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Barber\CQRS\Command\Barber\UploadPortfolioCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class UploadPortfolioRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:'.app(SettingsService::class)->int(SettingKey::UploadPortfolioMaxKb)],
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
