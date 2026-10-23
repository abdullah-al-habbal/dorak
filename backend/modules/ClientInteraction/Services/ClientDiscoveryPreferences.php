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
        public ?float $defaultRadius,
        public array $hiddenBrandIds,
        public bool $showUnavailable,
    ) {}

    public static function for(mixed $user): self
    {
        $preference = $user instanceof ClientModel
            ? ClientDiscoveryPreferenceModel::query()->where('client_id', $user->getKey())->first()
            : null;

        if (! $preference instanceof ClientDiscoveryPreferenceModel) {
            return new self(null, [], true);
        }

        $radius = $preference->getAttribute('default_radius');
        $hidden = $preference->getAttribute('hidden_brand_ids');

        return new self(
            defaultRadius: is_numeric($radius) && (float) $radius > 0 ? (float) $radius : null,
            hiddenBrandIds: is_array($hidden) ? array_values(array_map('strval', array_filter($hidden, 'is_scalar'))) : [],
            showUnavailable: $preference->getAttribute('show_unavailable') !== false,
        );
    }
}
