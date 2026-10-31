<?php

declare(strict_types=1);

namespace Modules\Settings\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Settings\CQRS\Command\UpdatePlatformSettingsCommand;
use Modules\Settings\Services\SettingsService;

final class UpdatePlatformSettingsHandler
{
    public function __construct(private readonly SettingsService $settings) {}

    public function handle(UpdatePlatformSettingsCommand $command): void
    {
        DB::transaction(fn () => $this->settings->update($command->values));
    }
}
