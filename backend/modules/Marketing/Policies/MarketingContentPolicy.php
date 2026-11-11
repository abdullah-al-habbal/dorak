<?php

declare(strict_types=1);

namespace Modules\Marketing\Policies;

use Modules\Admin\Models\AdminModel;

/** Website content (pages, sections, testimonials) is platform data: only an admin reads or writes it here. */
final class MarketingContentPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function create(mixed $actor): bool
    {
        return $this->viewAny($actor);
    }

    public function update(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }

    public function delete(mixed $actor, mixed $model): bool
    {
        return $this->viewAny($actor);
    }
}
