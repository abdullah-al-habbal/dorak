<?php

declare(strict_types=1);

namespace Modules\Language\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Language\Models\LanguageModel;

/** Which languages the platform offers is platform data: only an admin changes it. A non-admin or null actor is a denial. */
final class LanguagePolicy
{
    public function update(mixed $actor, LanguageModel $language): bool
    {
        return $actor instanceof AdminModel;
    }
}
