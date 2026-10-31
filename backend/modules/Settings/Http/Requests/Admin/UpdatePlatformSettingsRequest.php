<?php

declare(strict_types=1);

namespace Modules\Settings\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\CQRS\Command\UpdatePlatformSettingsCommand;
use Modules\Settings\Enums\SettingKey;

final class UpdatePlatformSettingsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $rules = ['settings' => ['required', 'array', 'min:1']];
        foreach (SettingKey::cases() as $key) {
            $rules['settings.'.$key->value] = ['sometimes', 'integer', 'min:'.$key->min(), 'max:'.$key->max()];
        }

        return $rules;
    }

    public function toCommand(): UpdatePlatformSettingsCommand
    {
        $values = [];
        foreach ($this->validated('settings') as $key => $value) {
            $values[$key] = (int) $value;
        }

        return new UpdatePlatformSettingsCommand($values);
    }
}
