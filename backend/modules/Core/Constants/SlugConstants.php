<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class SlugConstants
{
    /** Column length of a public slug (`brands`, `branches`, `barbers`). */
    public const int CORE_SLUG_COLUMN_LENGTH = 160;

    /** Leaves room for a `-NNN` clash suffix inside the column. */
    public const int CORE_SLUG_BASE_MAX_LENGTH = 150;
}
