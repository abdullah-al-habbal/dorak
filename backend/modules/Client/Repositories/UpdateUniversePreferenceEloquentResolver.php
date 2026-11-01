<?php

declare(strict_types=1);

namespace Modules\Client\Repositories;

use Modules\Client\Enums\UniverseEnum;
use Modules\Client\Models\ClientModel;

final class UpdateUniversePreferenceEloquentResolver
{
    public function updateUniverse(ClientModel $client, UniverseEnum $universe): void
    {
        $client->update(['preferred_universe' => $universe]);
    }
}
