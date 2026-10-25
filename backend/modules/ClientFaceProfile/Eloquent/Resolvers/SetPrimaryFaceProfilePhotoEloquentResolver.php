<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Eloquent\Resolvers;

use Illuminate\Support\Facades\DB;
use Modules\ClientFaceProfile\CQRS\Command\SetPrimaryFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class SetPrimaryFaceProfilePhotoEloquentResolver
{
    public function resolve(SetPrimaryFaceProfilePhotoCommand $command): ClientFaceProfileModel
    {
        return DB::transaction(function () use ($command): ClientFaceProfileModel {
            $profile = ClientFaceProfileModel::query()->lockForUpdate()->findOrFail($command->profileId);

            ClientFaceProfileModel::query()
                ->where('client_id', $profile->client_id)
                ->where('id', '!=', $profile->id)
                ->update(['is_primary' => false]);

            $profile->update(['is_primary' => true]);

            return $profile;
        });
    }
}
