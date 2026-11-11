<?php

declare(strict_types=1);

namespace Modules\Onboarding\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Modules\Onboarding\Models\OnboardingConfigurationModel;

/** @mixin OnboardingConfigurationModel */
final class AdminOnboardingConfigResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'locale' => $this->locale,
            'season' => $this->season?->value,
            'hero_image_url' => Storage::disk('public')->url($this->hero_image_path),
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
