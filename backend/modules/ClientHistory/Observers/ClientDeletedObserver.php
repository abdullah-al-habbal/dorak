<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Observers;

use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryMediaModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

/**
 * HIST-2: when a client account is deleted, its service history is kept for
 * aggregate recommendations but detached from the person. Runs synchronously
 * inside the deletion transaction so the account is never deleted with its
 * history still identifiable.
 */
final class ClientDeletedObserver
{
    public function deleted(ClientModel $client): void
    {
        $histories = ClientServiceHistoryModel::query()->where('client_id', $client->getKey());

        ClientServiceHistoryMediaModel::query()
            ->whereIn('client_service_history_id', (clone $histories)->select('id'))
            ->delete();

        $histories->update([
            'client_id' => null,
            'booking_id' => null,
            'client_notes' => null,
            'barber_notes' => null,
        ]);
    }
}
