<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Policies;

use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class ClientServiceHistoryPolicy
{
    public function view(ClientModel $client, ClientServiceHistoryModel $history): bool
    {
        return $history->client()->is($client);
    }
}
