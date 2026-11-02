<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Eloquent\Resolvers;

use Modules\ClientInteraction\CQRS\Command\UpdateDiscoveryPreferenceCommand;
use Modules\ClientInteraction\Models\ClientDiscoveryPreferenceModel;

final class UpdateDiscoveryPreferenceEloquentResolver
{
    public function resolve(UpdateDiscoveryPreferenceCommand $command): ClientDiscoveryPreferenceModel
    {
        $pref = ClientDiscoveryPreferenceModel::firstOrCreate(
            ['client_id' => $command->clientId],
        );

        $update = array_filter([
            'preferred_universe' => $command->preferredUniverse,
            'default_radius_km' => $command->defaultRadiusKm,
            'hidden_brand_ids' => $command->hiddenBrandIds,
            'allows_unavailable_results' => $command->allowsUnavailableResults,
        ], fn ($v) => $v !== null);

        if (! empty($update)) {
            $pref->update($update);
        }

        return $pref->fresh();
    }
}
