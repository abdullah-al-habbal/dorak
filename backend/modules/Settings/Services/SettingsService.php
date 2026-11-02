<?php

declare(strict_types=1);

namespace Modules\Settings\Services;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Modules\Settings\Constants\SettingsConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Models\PlatformSettingModel;

/**
 * Single read path for admin-editable platform limits. Overrides are cached as
 * one map; a missing row (or table) falls back to the SettingKey default.
 */
final class SettingsService
{
    public function int(SettingKey $key): int
    {
        return $this->overrides()[$key->value] ?? $key->default();
    }

    /** @return array<string, int> every key with its effective value. */
    public function all(): array
    {
        $values = [];
        foreach (SettingKey::cases() as $key) {
            $values[$key->value] = $this->int($key);
        }

        return $values;
    }

    /** @param  array<string, int>  $values  already validated against SettingKey bounds */
    public function update(array $values): void
    {
        foreach ($values as $key => $value) {
            PlatformSettingModel::query()->updateOrCreate(['setting_key' => $key], ['value_integer' => $value]);
        }

        Cache::forget(SettingsConstants::SETTINGS_CACHE_KEY);
    }

    /** @return array<string, int> */
    private function overrides(): array
    {
        try {
            return Cache::rememberForever(
                SettingsConstants::SETTINGS_CACHE_KEY,
                fn (): array => PlatformSettingModel::query()->pluck('value_integer', 'setting_key')->map(fn ($value): int => (int) $value)->all(),
            );
        } catch (QueryException) {
            return [];
        }
    }
}
