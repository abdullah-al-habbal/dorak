<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Modules\Client\CQRS\Query\Client\GetProfileQuery;
use Modules\Client\Models\ClientModel;

final class GetProfileEloquentResolver
{
    public function resolve(GetProfileQuery $query): ClientModel
    {
        return ClientModel::findOrFail($query->clientId);
    }
}
