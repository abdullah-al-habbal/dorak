<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Policies;

use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class ClientServiceHistoryPolicy
{
    public function view(ClientModel $client, ClientServiceHistoryModel $history): bool
    {
        return $history->client()->is($client);
    }

    public function update(ClientModel $client, ClientServiceHistoryModel $history): bool
    {
        return $history->client()->is($client);
    }

    public function updateBarberNotes(BarberModel $barber, ClientServiceHistoryModel $history): bool
    {
        return $history->barber()->is($barber);
    }
}
