<?php

declare(strict_types=1);

namespace Modules\Onboarding\Policies;

use Modules\Admin\Models\AdminModel;

/** The onboarding hero configuration is platform data: only an admin reads or changes it. */
final class OnboardingConfigurationPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }
}
