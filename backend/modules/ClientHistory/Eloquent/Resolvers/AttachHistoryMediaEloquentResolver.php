<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Eloquent\Resolvers;

use Modules\ClientHistory\CQRS\Command\AttachHistoryMediaCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryMediaModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class AttachHistoryMediaEloquentResolver
{
    public function resolve(AttachHistoryMediaCommand $command): ClientServiceHistoryMediaModel
    {
        ClientServiceHistoryModel::query()
            ->where('client_id', $command->clientId)
            ->findOrFail($command->historyId);

        return ClientServiceHistoryMediaModel::create([
            'history_id' => $command->historyId,
            'photo_url' => $command->photoUrl,
            'photo_type' => $command->photoType,
            'uploaded_at' => now(),
        ]);
    }
}
