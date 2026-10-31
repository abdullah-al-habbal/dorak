<?php

declare(strict_types=1);

namespace Modules\Settings\Policies;

use Modules\Admin\Models\AdminModel;

final class PlatformSettingPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor): bool
    {
        return $this->viewAny($actor);
    }
}
