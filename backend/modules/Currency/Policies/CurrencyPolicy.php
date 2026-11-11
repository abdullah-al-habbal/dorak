<?php

declare(strict_types=1);

namespace Modules\Currency\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Currency\Models\CurrencyModel;

/** Currencies and exchange rates are platform data: only an admin writes them. A non-admin or null actor is a denial. */
final class CurrencyPolicy
{
    public function create(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor, CurrencyModel $currency): bool
    {
        return $this->create($actor);
    }
}
