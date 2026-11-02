<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Services;

use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Models\ClientDiscoveryPreferenceModel;

/**
 * A signed-in client's saved discovery preferences as Explore applies them
 * (BE-14, Task 47). Guests and clients without saved preferences get the
 * neutral values.
 */
final readonly class ClientDiscoveryPreferences
{
    /** @param list<string> $hiddenBrandIds */
    private function __construct(
        public ?float $defaultRadiusKm,
        public array $hiddenBrandIds,
        public bool $allowsUnavailableResults,
    ) {}

    public static function for(mixed $user): self
    {
        $preference = $user instanceof ClientModel
            ? ClientDiscoveryPreferenceModel::query()->where('client_id', $user->getKey())->first()
            : null;

        if (! $preference instanceof ClientDiscoveryPreferenceModel) {
            return new self(null, [], true);
        }

        $radius = $preference->getAttribute('default_radius_km');
        $hidden = $preference->getAttribute('hidden_brand_ids');

        return new self(
            defaultRadiusKm: is_numeric($radius) && (float) $radius > 0 ? (float) $radius : null,
            hiddenBrandIds: is_array($hidden) ? array_values(array_map('strval', array_filter($hidden, 'is_scalar'))) : [],
            allowsUnavailableResults: $preference->getAttribute('allows_unavailable_results') !== false,
        );
    }
}
