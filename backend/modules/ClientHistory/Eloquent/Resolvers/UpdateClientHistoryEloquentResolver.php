<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Eloquent\Resolvers;

use Modules\ClientHistory\CQRS\Command\UpdateClientHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class UpdateClientHistoryEloquentResolver
{
    public function resolve(UpdateClientHistoryCommand $command): ClientServiceHistoryModel
    {
        $history = ClientServiceHistoryModel::query()->findOrFail($command->historyId);
        $history->update($command->attributes);

        return $history;
    }
}
