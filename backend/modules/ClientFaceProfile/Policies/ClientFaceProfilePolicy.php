<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Policies;

use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class ClientFaceProfilePolicy
{
    public function view(ClientModel $client, ClientFaceProfileModel $profile): bool
    {
        return $profile->client()->is($client);
    }

    public function delete(ClientModel $client, ClientFaceProfileModel $profile): bool
    {
        return $profile->client()->is($client);
    }

    public function update(ClientModel $client, ClientFaceProfileModel $profile): bool
    {
        return $profile->client()->is($client);
    }
}
