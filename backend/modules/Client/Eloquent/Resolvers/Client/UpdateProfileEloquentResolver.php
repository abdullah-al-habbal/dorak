<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\UpdateProfileCommand;
use Modules\Client\Models\ClientModel;

final class UpdateProfileEloquentResolver
{
    public function resolve(UpdateProfileCommand $command): ClientModel
    {
        $client = ClientModel::findOrFail($command->clientId);

        $data = array_filter([
            'name' => $command->name,
            'email' => $command->email,
            'password' => $command->password ? Hash::make($command->password) : null,
            'phone' => $command->phone,
        ], fn ($value) => $value !== null);

        if ($command->email !== null && strcasecmp($command->email, (string) $client->email) !== 0) {
            $data['email_verified_at'] = null;
        }

        if ($data !== []) {
            $client->update($data);
        }

        return $client;
    }
}
