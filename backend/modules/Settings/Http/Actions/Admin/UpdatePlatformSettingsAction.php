<?php

declare(strict_types=1);

namespace Modules\Settings\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Settings\Handlers\UpdatePlatformSettingsHandler;
use Modules\Settings\Http\Requests\Admin\UpdatePlatformSettingsRequest;
use Modules\Settings\Models\PlatformSettingModel;
use Modules\Settings\Services\SettingsService;

final class UpdatePlatformSettingsAction extends BaseApiAction
{
    public function __construct(
        private readonly UpdatePlatformSettingsHandler $handler,
        private readonly SettingsService $settings,
    ) {}

    public function __invoke(UpdatePlatformSettingsRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('update', PlatformSettingModel::class);
        $this->handler->handle($request->toCommand());

        return $this->ok(data: $this->settings->all(), message: __('settings::messages.settings_saved'));
    }
}
