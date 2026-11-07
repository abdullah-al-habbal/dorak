<?php

declare(strict_types=1);

namespace Modules\Settings\Http\Requests\Admin;

use Illuminate\Validation\Validator;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\CQRS\Command\UpdatePlatformSettingsCommand;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

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

    /** Cross-field limits: the effective value is the submitted one, else the stored one. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $settings = app(SettingsService::class);
            $effective = fn (SettingKey $key): int => (int) $this->input('settings.'.$key->value, $settings->int($key));

            if ($effective(SettingKey::PaginationDefaultPerPage) > $effective(SettingKey::PaginationMaxPerPage)) {
                $validator->errors()->add('settings.'.SettingKey::PaginationDefaultPerPage->value, __('settings::messages.default_page_size_above_max'));
            }
            if ($effective(SettingKey::DashboardRefreshTtlSeconds) < $effective(SettingKey::DashboardSessionTtlSeconds)) {
                $validator->errors()->add('settings.'.SettingKey::DashboardRefreshTtlSeconds->value, __('settings::messages.refresh_shorter_than_session'));
            }
        });
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
