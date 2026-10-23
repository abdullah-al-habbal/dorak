<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Requests\Shared;

use Modules\ClientInteraction\Services\ClientDiscoveryPreferences;

/**
 * Applies a signed-in client's saved discovery preferences to an explore
 * request (Task 47): a missing `radius` falls back to `default_radius`, and
 * `show_unavailable = false` means `available_now` unless the request says
 * otherwise. `hidden_brand_ids` is read by the branch query.
 */
trait AppliesDiscoveryPreferences
{
    private ?ClientDiscoveryPreferences $discoveryPreferences = null;

    protected function prepareForValidation(): void
    {
        $preferences = $this->discoveryPreferences();
        if (! $this->filled('radius') && $preferences->defaultRadius !== null) {
            $this->merge(['radius' => $preferences->defaultRadius]);
        }
    }

    protected function discoveryPreferences(): ClientDiscoveryPreferences
    {
        return $this->discoveryPreferences ??= ClientDiscoveryPreferences::for($this->user('client'));
    }

    protected function availableNowWithPreferences(): bool
    {
        return $this->has('available_now')
            ? $this->boolean('available_now')
            : ! $this->discoveryPreferences()->showUnavailable;
    }
}
