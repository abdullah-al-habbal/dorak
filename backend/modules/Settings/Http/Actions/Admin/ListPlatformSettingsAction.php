<?php

declare(strict_types=1);

namespace Modules\Settings\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Models\PlatformSettingModel;
use Modules\Settings\Services\SettingsService;

final class ListPlatformSettingsAction extends BaseApiAction
{
    public function __construct(private readonly SettingsService $settings) {}

    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', PlatformSettingModel::class);

        return $this->ok(data: array_map(fn (SettingKey $key): array => [
            'key' => $key->value,
            'group' => $key->group()->value,
            'value' => $this->settings->int($key),
            'default' => $key->default(),
            'min' => $key->min(),
            'max' => $key->max(),
        ], SettingKey::cases()));
    }
}
