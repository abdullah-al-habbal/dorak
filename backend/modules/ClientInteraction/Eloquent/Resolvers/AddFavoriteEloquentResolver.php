<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Eloquent\Resolvers;

use Modules\ClientInteraction\CQRS\Command\AddFavoriteCommand;
use Modules\ClientInteraction\Models\ClientFavoriteModel;

final class AddFavoriteEloquentResolver
{
    public function resolve(AddFavoriteCommand $command): ClientFavoriteModel
    {
        return ClientFavoriteModel::firstOrCreate([
            'client_id' => $command->clientId,
            'favorited_id' => $command->favoritedId,
            'favorited_type' => $command->favoritedType,
        ]);
    }
}
