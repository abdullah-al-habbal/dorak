<?php

declare(strict_types=1);

namespace Modules\Client\Repositories;

use Modules\Client\CQRS\Command\Client\ChangePasswordCommand;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\AccountPasswordReplacement;

final class ChangePasswordEloquentResolver
{
    public function __construct(
        private readonly AccountPasswordReplacement $passwords,
    ) {}

    public function execute(ChangePasswordCommand $command): void
    {
        $client = ClientModel::findOrFail($command->clientId);

        // Every token and dashboard session, and any unused dashboard reset link (BG-60).
        $this->passwords->replace(DashboardActorTypeEnum::Owner, $client, $command->password);
    }
}
