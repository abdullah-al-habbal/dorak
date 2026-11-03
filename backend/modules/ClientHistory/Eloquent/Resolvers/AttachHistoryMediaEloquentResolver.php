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
            ->findOrFail($command->historyId);

        return ClientServiceHistoryMediaModel::create([
            'client_service_history_id' => $command->historyId,
            'image_path' => $command->photoPath,
            'photo_type' => $command->photoType,
            'uploaded_at' => now(),
        ]);
    }
}
